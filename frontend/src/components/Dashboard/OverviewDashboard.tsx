'use client';

import React from 'react';
import { AnalysisData } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, FileCode, GitBranch, Languages, Scale } from 'lucide-react';

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
    if (data.functionAnalysis) {
      const { avgFunctionsPerFile, totalFunctions, languages } = data.functionAnalysis;
      if (avgFunctionsPerFile > 2 && avgFunctionsPerFile < 8) score += 20;
      if (Object.keys(languages).length > 1) score += 15;
      if (totalFunctions > 50) score += 15;
    }
    if (data.fileCounts.total > 10) score += 25;
    if (data.totalCharacters / data.fileCounts.total > 1000) score += 25;
    return Math.min(score, 100);
  };

  const healthScore = calculateHealthScore();

  const getHealthBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score > 80) return "default";
    if (score > 60) return "secondary";
    return "destructive";
  };
  
  const codeDensity = data.functionAnalysis
    ? (data.functionAnalysis.totalFunctions / data.fileCounts.total).toFixed(1)
    : '0';

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
          <CardTitle className="text-sm font-medium">Total Functions</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.functionAnalysis?.totalFunctions || 0}</div>
          <p className="text-xs text-muted-foreground">Across all files</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Code Density</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{codeDensity}</div>
          <p className="text-xs text-muted-foreground">functions/file</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Languages</CardTitle>
          <Languages className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(data.functionAnalysis?.languages || {}).length}</div>
          <p className="text-xs text-muted-foreground">Detected in repo</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>File Distribution</CardTitle>
          <CardDescription>File counts by type.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileCode className="mx-auto h-6 w-6 mb-2" />
                <p className="text-xl font-bold">{data.fileCounts.total}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            {Object.entries(data.fileCounts).map(([lang, count]) => {
                if(lang === 'total' || count === 0) return null;
                return (
                    <div key={lang} className="text-center p-4 bg-gray-50 rounded-lg">
                        <FileCode className="mx-auto h-6 w-6 mb-2" />
                        <p className="text-xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground capitalize">{lang}</p>
                    </div>
                )
            })}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Repository Insights</CardTitle>
          <CardDescription>Detailed code metrics.</CardDescription>
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
                <TableCell>Avg. Functions/File</TableCell>
                <TableCell className="text-right">{data.functionAnalysis?.avgFunctionsPerFile.toFixed(1) || '0'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data.functionAnalysis && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Language Analysis</CardTitle>
            <CardDescription>
              A breakdown of function and file counts by programming language.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Language</TableHead>
                  <TableHead>Functions</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Density (Funcs/File)</TableHead>
                  <TableHead className="text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.functionAnalysis.languages).map(([language, stats]) => (
                  <TableRow key={language}>
                    <TableCell className="font-medium capitalize">{language}</TableCell>
                    <TableCell>{stats.functions}</TableCell>
                    <TableCell>{stats.files}</TableCell>
                    <TableCell>{stats.files > 0 ? (stats.functions / stats.files).toFixed(1) : '0'}</TableCell>
                    <TableCell className="text-right">
                      {((stats.functions / (data.functionAnalysis?.totalFunctions || 1)) * 100).toFixed(1)}%
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