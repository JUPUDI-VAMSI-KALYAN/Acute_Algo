'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getRepositoryFunctions, AlgorithmFunction } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
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
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<AlgorithmFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFunctions, setFilteredFunctions] = useState<AlgorithmFunction[]>([]);
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
      const result = await getRepositoryFunctions(parseInt(repositoryId), page, 50, false); // Get all functions, not just algorithms
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

  // Filter functions based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = functions.filter(func => 
        func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.file_analyses.file_path.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFunctions(filtered);
    } else {
      setFilteredFunctions(functions);
    }
  }, [functions, searchTerm]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.total_pages) {
      loadFunctions(pagination.page + 1);
    }
  };


  
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
    // Remove temp directory pattern if present
    const match = path.match(/T\/[^\/]+\/(.*)/);
    if (match && match[1]) {
      return match[1];
    }
    return path;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Loading functions...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          {error}
        </div>
      );
    }

    if (!repositoryId) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No Repository Selected</h3>
          <p className="text-muted-foreground mb-4">
            Please select a repository from your dashboard to view its functions.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      );
    }

    if (functions.length === 0) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No Functions Found</h3>
          <p className="text-muted-foreground">
            The selected repository does not contain any detectable functions.
          </p>
        </div>
      );
    }

    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>All Functions ({pagination.total})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search functions or files..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lines</TableHead>
                <TableHead>Algorithm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunctions.map((func) => (
                <TableRow key={func.id}>
                  <TableCell className="font-medium">{func.name}</TableCell>
                  <TableCell className="text-muted-foreground">{getCleanPath(func.file_analyses.file_path)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getLanguageColor(func.file_analyses.language)} text-white`}>
                      {func.file_analyses.language}
                    </Badge>
                  </TableCell>
                                     <TableCell>{func.type}</TableCell>
                  <TableCell>{func.line_count}</TableCell>
                  <TableCell>
                    {func.is_algorithm ? (
                      <Badge variant="default" className="bg-green-600">
                        Algorithm ({func.algorithm_score.toFixed(1)})
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Function</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.page < pagination.total_pages && !searchTerm && (
            <div className="mt-6 text-center">
              <Button onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Function Analysis</h1>
        <p className="text-muted-foreground">
          Detailed analysis of all functions detected in the repository
        </p>
      </div>
      {renderContent()}
    </div>
  );
} 