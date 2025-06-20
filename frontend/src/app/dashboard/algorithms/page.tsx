"use client"

import React, { useState, useEffect, useCallback } from 'react';
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
import Link from 'next/link';

export default function AlgorithmsPage() {
  const [algorithms, setAlgorithms] = useState<AlgorithmFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
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

  const handleLoadMore = () => {
    if (pagination.page < pagination.total_pages) {
      loadAlgorithms(pagination.page + 1);
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Loading algorithms...</span>
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
            Please select a repository from your dashboard to view its algorithms.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      );
    }

    if (algorithms.length === 0) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No Algorithms Found</h3>
          <p className="text-muted-foreground">
            The selected repository does not contain any functions classified as algorithms.
          </p>
        </div>
      );
    }

    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Identified Algorithms ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Lines</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {algorithms.map((algo) => (
                <TableRow key={algo.id}>
                  <TableCell className="font-medium">{algo.name}</TableCell>
                  <TableCell className="text-muted-foreground">{algo.file_analyses.file_path}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getLanguageColor(algo.file_analyses.language)} text-white`}>
                      {algo.file_analyses.language}
                    </Badge>
                  </TableCell>
                  <TableCell>{algo.algorithm_score.toFixed(2)}</TableCell>
                  <TableCell>{algo.line_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.page < pagination.total_pages && (
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
    <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Algorithms
        </h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border shadow-sm w-full h-full">
         {renderContent()}
      </div>
    </main>
  );
}
