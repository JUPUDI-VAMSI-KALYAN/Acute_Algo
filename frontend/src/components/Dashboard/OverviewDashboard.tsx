'use client';

import React from 'react';
import { AnalysisData } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, FileCode, Languages, Scale } from 'lucide-react';

interface OverviewDashboardProps {
  data: AnalysisData;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ data }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateHealthScore = (): number => {
    let score = 0;
    // Health score based on repository structure only
    if (data.fileCounts.total > 10) score += 30;
    if (data.totalCharacters / data.fileCounts.total > 1000) score += 25;
    
    // Count languages from file counts instead of function analysis
    const languageCount = [
      data.fileCounts.javascript > 0 ? 1 : 0,
      data.fileCounts.python > 0 ? 1 : 0,
      data.fileCounts.typescript > 0 ? 1 : 0
    ].reduce((sum, count) => sum + count, 0);
    
    if (languageCount > 1) score += 20;
    if (data.fileCounts.total > 50) score += 25;
    return Math.min(score, 100);
  };

  const healthScore = calculateHealthScore();

  const getHealthBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score > 80) return "default";
    if (score > 60) return "secondary";
    return "destructive";
  };

  // Get language count from file counts instead of function analysis
  const getLanguageCount = (): number => {
    return [
      data.fileCounts.javascript > 0 ? 1 : 0,
      data.fileCounts.python > 0 ? 1 : 0,
      data.fileCounts.typescript > 0 ? 1 : 0
    ].reduce((sum, count) => sum + count, 0);
  };

  // Get language entries for the distribution table
  const getLanguageEntries = (): [string, number][] => {
    const entries: [string, number][] = [];
    if (data.fileCounts.javascript > 0) {
      entries.push(['JavaScript', data.fileCounts.javascript]);
    }
    if (data.fileCounts.python > 0) {
      entries.push(['Python', data.fileCounts.python]);
    }
    if (data.fileCounts.typescript > 0) {
      entries.push(['TypeScript', data.fileCounts.typescript]);
    }
    return entries;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{healthScore}/100</div>
          <Badge variant={getHealthBadgeVariant(healthScore)}>
            {healthScore > 80 ? "Excellent" : healthScore > 60 ? "Good" : "Needs Improvement"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          <FileCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.fileCounts.total}</div>
          <p className="text-xs text-muted-foreground">In repository</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Code Size</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalCharacters)}</div>
          <p className="text-xs text-muted-foreground">total characters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Languages</CardTitle>
          <Languages className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getLanguageCount()}</div>
          <p className="text-xs text-muted-foreground">Detected in repo</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>File Distribution</CardTitle>
          <CardDescription>File counts by type.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <FileCode className="mx-auto h-6 w-6 mb-2" />
                <p className="text-xl font-bold">{data.fileCounts.total}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            {data.fileCounts.javascript > 0 && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FileCode className="mx-auto h-6 w-6 mb-2" />
                  <p className="text-xl font-bold">{data.fileCounts.javascript}</p>
                  <p className="text-sm text-muted-foreground">JavaScript</p>
              </div>
            )}
            {data.fileCounts.python > 0 && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FileCode className="mx-auto h-6 w-6 mb-2" />
                  <p className="text-xl font-bold">{data.fileCounts.python}</p>
                  <p className="text-sm text-muted-foreground">Python</p>
              </div>
            )}
            {data.fileCounts.typescript > 0 && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FileCode className="mx-auto h-6 w-6 mb-2" />
                  <p className="text-xl font-bold">{data.fileCounts.typescript}</p>
                  <p className="text-sm text-muted-foreground">TypeScript</p>
              </div>
            )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Repository Insights</CardTitle>
          <CardDescription>Detailed repository metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Characters</TableCell>
                <TableCell className="text-right">{formatNumber(data.totalCharacters)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Avg. Chars/File</TableCell>
                <TableCell className="text-right">{formatNumber(Math.round(data.totalCharacters / (data.fileCounts.total || 1)))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Repository Size</TableCell>
                <TableCell className="text-right">{data.fileCounts.total > 100 ? 'Large' : data.fileCounts.total > 30 ? 'Medium' : 'Small'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {getLanguageEntries().length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>
              Programming languages detected in the repository by file count.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Language</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getLanguageEntries().map(([language, count]) => (
                  <TableRow key={language}>
                    <TableCell className="font-medium">{language}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell className="text-right">
                      {((count / (data.fileCounts.total || 1)) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};