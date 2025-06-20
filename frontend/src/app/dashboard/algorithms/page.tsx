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
import Link from 'next/link';

type ScoreFilter = 'all' | 'high' | 'medium' | 'low';
type LanguageFilter = 'all' | string;

export default function AlgorithmsPage() {
  const [algorithms, setAlgorithms] = useState<AlgorithmFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const repoId = searchParams.get('repo');
    if (repoId) {
      setRepositoryId(repoId);
    }
  }, [searchParams]);

  const loadAlgorithms = useCallback(async (page: number) => {
    if (!repositoryId) return;

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const result = await getRepositoryFunctions(parseInt(repositoryId), page, 20, true);
      const newAlgorithms = result.functions as AlgorithmFunction[];

      if (page === 1) {
        setAlgorithms(newAlgorithms);
      } else {
        setAlgorithms(prev => [...prev, ...newAlgorithms]);
      }
      setPagination({ page: result.page, total: result.total, total_pages: result.total_pages });
    } catch (err) {
      setError('Failed to load algorithms.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    if (repositoryId) {
      loadAlgorithms(1);
    }
  }, [repositoryId, loadAlgorithms]);

  // Get unique languages for filter
  const availableLanguages = useMemo(() => {
    const languages = new Set(algorithms.map(algo => algo.file_analyses.language));
    return Array.from(languages).sort();
  }, [algorithms]);

  // Filter algorithms based on all filters
  const filteredAlgorithms = useMemo(() => {
    return algorithms.filter(algo => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        algo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        algo.file_analyses.file_path.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Score filter
      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'high' && algo.algorithm_score >= 0.8) ||
        (scoreFilter === 'medium' && algo.algorithm_score >= 0.6 && algo.algorithm_score < 0.8) ||
        (scoreFilter === 'low' && algo.algorithm_score < 0.6);
      
      // Language filter
      const matchesLanguage = languageFilter === 'all' || 
        algo.file_analyses.language === languageFilter;
      
      return matchesSearch && matchesScore && matchesLanguage;
    });
  }, [algorithms, searchTerm, scoreFilter, languageFilter]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.total_pages) {
      loadAlgorithms(pagination.page + 1);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setScoreFilter('all');
    setLanguageFilter('all');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm !== '') count++;
    if (scoreFilter !== 'all') count++;
    if (languageFilter !== 'all') count++;
    return count;
  }, [searchTerm, scoreFilter, languageFilter]);
  
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
          <span className="ml-3 text-gray-500">Loading algorithms...</span>
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

  if (algorithms.length === 0) {
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
              The selected repository does not contain any functions classified as algorithms.
            </p>
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
              Identified Algorithms ({filteredAlgorithms.length} of {algorithms.length})
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlgorithms.map((algo) => {
                  const scoreBadge = getScoreBadge(algo.algorithm_score);
                  return (
                    <TableRow key={algo.id}>
                      <TableCell className="font-medium">{algo.name}</TableCell>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Load More Button - Fixed at bottom */}
        {pagination.page < pagination.total_pages && (
          <div className="border-t p-4 bg-background shrink-0">
            <div className="text-center">
              <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
