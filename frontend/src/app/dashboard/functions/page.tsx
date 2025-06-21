'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getRepositoryFunctions, AlgorithmFunction } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
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

type FilterType = 'all' | 'algorithm' | 'regular';
type LanguageFilter = 'all' | string;

export default function FunctionsPage() {
  const router = useRouter();
  const [functions, setFunctions] = useState<AlgorithmFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const repoFromUrl = searchParams.get('repo');
    
    if (repoFromUrl) {
      setRepositoryId(repoFromUrl);
    }
  }, [searchParams]);

  const loadFunctions = useCallback(async (page: number) => {
    if (!repositoryId) return;

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const result = await getRepositoryFunctions(parseInt(repositoryId), page, 50, false);
      const newFunctions = result.functions as AlgorithmFunction[];

      if (page === 1) {
        setFunctions(newFunctions);
      } else {
        setFunctions(prev => [...prev, ...newFunctions]);
      }
      setPagination({ page: result.page, total: result.total, total_pages: result.total_pages });
    } catch (err) {
      setError('Failed to load functions.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    if (repositoryId) {
      loadFunctions(1);
    }
  }, [repositoryId, loadFunctions]);

  // Get unique languages for filter
  const availableLanguages = useMemo(() => {
    const languages = new Set(functions.map(func => func.file_analyses.language));
    return Array.from(languages).sort();
  }, [functions]);

  // Filter functions based on all filters
  const filteredFunctions = useMemo(() => {
    return functions.filter(func => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.file_analyses.file_path.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'algorithm' && func.algorithm_score > 0.5) ||
        (typeFilter === 'regular' && func.algorithm_score <= 0.5);
      
      // Language filter
      const matchesLanguage = languageFilter === 'all' || 
        func.file_analyses.language === languageFilter;
      
      return matchesSearch && matchesType && matchesLanguage;
    });
  }, [functions, searchTerm, typeFilter, languageFilter]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.total_pages) {
      loadFunctions(pagination.page + 1);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLanguageFilter('all');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm !== '') count++;
    if (typeFilter !== 'all') count++;
    if (languageFilter !== 'all') count++;
    return count;
  }, [searchTerm, typeFilter, languageFilter]);

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
            Functions
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Loading functions...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Functions
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
            Functions
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No Repository Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a repository from your dashboard to view its functions.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (functions.length === 0) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Functions
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No Functions Found</h3>
            <p className="text-muted-foreground">
              The selected repository does not contain any detectable functions.
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
          Functions
        </h1>
      </div>

      {/* Fixed Filters Section */}
      <Card className="shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              All Functions ({filteredFunctions.length} of {functions.length})
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
                placeholder="Search functions or files..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as FilterType)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Functions</SelectItem>
                <SelectItem value="algorithm">Algorithms Only</SelectItem>
                <SelectItem value="regular">Regular Functions</SelectItem>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Algorithm Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFunctions.map((func) => (
                  <TableRow 
                    key={func.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      console.log('Navigating to function:', func.id);
                      router.push(`/dashboard/functions/${func.id}`);
                    }}
                  >
                    <TableCell className="font-medium">{func.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {getCleanPath(func.file_analyses.file_path)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getLanguageColor(func.file_analyses.language)} text-white`}>
                        {func.file_analyses.language}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={func.algorithm_score > 0.5 ? "default" : "secondary"}>
                        {func.algorithm_score > 0.5 ? "Algorithm" : "Function"}
                      </Badge>
                    </TableCell>
                    <TableCell>{func.line_count}</TableCell>
                    <TableCell>
                      <span className={func.algorithm_score > 0.5 ? "font-semibold text-primary" : ""}>
                        {func.algorithm_score.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
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