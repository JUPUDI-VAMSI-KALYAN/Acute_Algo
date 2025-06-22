"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getRepositoryFunctions, AlgorithmFunction } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from 'lucide-react';
import { DataTablePagination } from '@/components/Dashboard/DataTablePagination';
import Link from 'next/link';

type ScoreFilter = 'all' | 'high' | 'medium' | 'low';
type LanguageFilter = 'all' | string;

export default function AlgorithmsPage() {
  const [algorithms, setAlgorithms] = useState<AlgorithmFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0, limit: 20 });
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  
  const searchParams = useSearchParams();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const repoId = searchParams.get('repo');
    if (repoId) {
      setRepositoryId(repoId);
    }
  }, [searchParams]);

  const loadAlgorithms = useCallback(async (
    page: number, 
    limit: number, 
    searchTerm?: string, 
    languageFilter?: string,
    scoreFilter?: ScoreFilter
  ) => {
    if (!repositoryId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getRepositoryFunctions(
        parseInt(repositoryId), 
        page, 
        limit, 
        true, // Always get algorithms only
        searchTerm,
        languageFilter,
        scoreFilter
      );
      
      const newAlgorithms = result.functions as AlgorithmFunction[];
      setAlgorithms(newAlgorithms);
      setPagination({ 
        page: result.page, 
        total: result.total, 
        total_pages: result.total_pages,
        limit: result.limit
      });

      // Extract available languages from the current data
      const languages = new Set(newAlgorithms.map(algo => algo.file_analyses.language));
      setAvailableLanguages(Array.from(languages).sort());
      
    } catch (err) {
      setError('Failed to load algorithms.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [repositoryId]);

  // Load algorithms when filters change
  useEffect(() => {
    if (repositoryId) {
      loadAlgorithms(1, pagination.limit, debouncedSearchTerm, languageFilter, scoreFilter);
    }
  }, [repositoryId, debouncedSearchTerm, languageFilter, scoreFilter, pagination.limit, loadAlgorithms]);

  const handlePageChange = (newPage: number) => {
    loadAlgorithms(newPage, pagination.limit, debouncedSearchTerm, languageFilter, scoreFilter);
  };

  const handlePerPageChange = (newLimit: number) => {
    loadAlgorithms(1, newLimit, debouncedSearchTerm, languageFilter, scoreFilter);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setScoreFilter('all');
    setLanguageFilter('all');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchTerm !== '') count++;
    if (scoreFilter !== 'all') count++;
    if (languageFilter !== 'all') count++;
    return count;
  }, [debouncedSearchTerm, scoreFilter, languageFilter]);
  
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-orange-500',
      cpp: 'bg-purple-500',
      c: 'bg-gray-500',
      go: 'bg-cyan-500',
      rust: 'bg-red-500',
      php: 'bg-indigo-500',
      ruby: 'bg-red-400',
    };
    return colors[language.toLowerCase()] || 'bg-gray-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 font-semibold';
    if (score >= 0.6) return 'text-yellow-600 font-medium';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return { variant: 'default' as const, label: 'High Confidence' };
    if (score >= 0.6) return { variant: 'secondary' as const, label: 'Medium Confidence' };
    return { variant: 'outline' as const, label: 'Low Confidence' };
  };

  const getCleanPath = (path: string) => {
    const match = path.match(/T\/[^\/]+\/(.*)/);
    if (match && match[1]) {
      return match[1];
    }
    return path;
  };

  if (loading) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Algorithms
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Loading algorithms...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Algorithms
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center text-red-500">
          {error}
        </div>
      </main>
    );
  }

  if (!repositoryId) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Algorithms
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No Repository Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a repository from your dashboard to view its algorithms.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (algorithms.length === 0 && !loading) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Algorithms
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No Algorithms Found</h3>
            <p className="text-muted-foreground">
              {activeFiltersCount > 0 
                ? "No algorithms match the current filters. Try adjusting your search criteria."
                : "The selected repository does not contain any functions classified as algorithms."
              }
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Algorithms
        </h1>
      </div>

      {/* Fixed Filters Section */}
      <Card className="shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Identified Algorithms ({pagination.total} total)
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search algorithms or files..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* Score Filter */}
            <Select value={scoreFilter} onValueChange={(value) => setScoreFilter(value as ScoreFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (≥0.8)</SelectItem>
                <SelectItem value="medium">Medium (0.6-0.8)</SelectItem>
                <SelectItem value="low">Low (&lt;0.6)</SelectItem>
              </SelectContent>
            </Select>

            {/* Language Filter */}
            {availableLanguages.length > 0 && (
              <Select value={languageFilter} onValueChange={(value) => setLanguageFilter(value as LanguageFilter)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getLanguageColor(lang)}`} />
                        {lang}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scrollable Table Container - Takes remaining space */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {algorithms.map((algo) => {
                  const scoreBadge = getScoreBadge(algo.algorithm_score);
                  return (
                    <TableRow key={algo.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link 
                          href={`/dashboard/algorithms/${algo.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        >
                          {algo.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {getCleanPath(algo.file_analyses.file_path)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getLanguageColor(algo.file_analyses.language)} text-white`}>
                          {algo.file_analyses.language}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={scoreBadge.variant}>
                          {scoreBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(algo.algorithm_score)}>
                          {algo.algorithm_score.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{algo.line_count}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/algorithms/${algo.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Controls - Fixed at bottom */}
        {pagination.total > 0 && (
          <div className="border-t bg-background shrink-0">
            <DataTablePagination
              page={pagination.page}
              count={pagination.total}
              perPage={pagination.limit}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        )}
      </Card>
    </main>
  );
}
