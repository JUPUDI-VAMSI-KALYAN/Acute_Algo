import React, { useState, useEffect, useCallback } from 'react';
import { getRepositoryOverview, AnalysisData } from '../../lib/api';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileCode, Calendar, CheckCircle, Scale, TrendingUp } from 'lucide-react';

interface RepositoryDetailProps {
  repositoryId: string;
  onDataLoaded?: (data: AnalysisData) => void;
}

interface RepositoryOverviewData {
  id: number;
  name: string;
  githubUrl: string;
  lastAnalyzed: string;
  totalFunctions: number;
  totalAlgorithms: number;
  totalAnalyzedFiles: number;
  fileCounts: {
    javascript: number;
    python: number;
    typescript: number;
    total: number;
  };
}

export const RepositoryDetail: React.FC<RepositoryDetailProps> = ({ repositoryId, onDataLoaded }) => {
  const [data, setData] = useState<RepositoryOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadRepositoryData = useCallback(async (attempt = 1) => {
    let requestError: Error | null = null;
    try {
      setLoading(true);
      const analysisData = await getRepositoryOverview(parseInt(repositoryId));
      setData(analysisData as unknown as RepositoryOverviewData);
      setError(''); // Clear error on success
    } catch (err: unknown) {
      requestError = err as Error;
      if (axios.isAxiosError(err) && err.response?.status === 404 && attempt < 4) {
        // If it's a 404, retry a few times with a delay
        console.warn(`Repository not found, retrying... (Attempt ${attempt})`);
        setTimeout(() => loadRepositoryData(attempt + 1), 1500 * attempt);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load repository data');
        console.error('Error loading repository data:', err);
      }
    } finally {
      // Only set loading to false if we are not retrying
      if (attempt >= 4 || !(axios.isAxiosError(requestError) && requestError.response?.status === 404)) {
         setLoading(false);
      }
    }
  }, [repositoryId]);

  useEffect(() => {
    loadRepositoryData();
  }, [loadRepositoryData]);

  useEffect(() => {
    if (data && onDataLoaded) {
      const headerData: AnalysisData = {
        repositoryName: data.name,
        totalCharacters: 0, // Not available in overview
        fileCounts: { total: data.totalAnalyzedFiles, javascript: 0, python: 0, typescript: 0 },
        directoryTree: '',
        fileContents: '',
        functionAnalysis: {
          totalFunctions: data.totalFunctions,
          totalAlgorithms: data.totalAlgorithms,
          totalAnalyzedFiles: data.totalAnalyzedFiles,
          avgFunctionsPerFile: 0, // Not available in overview
          avgAlgorithmsPerFile: 0, // Not available in overview
          mostCommonLanguage: 'N/A',
          languages: {},
          files: [],
          largestFiles: [],
        }
      };
      onDataLoaded(headerData);
    }
  }, [data, onDataLoaded]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Calculate repository health and insights
  const calculateHealthScore = (): number => {
    if (!data) return 0;
    let score = 0;
    
    // Algorithm density (functions with algorithms)
    const algorithmDensity = data.totalFunctions > 0 ? (data.totalAlgorithms / data.totalFunctions) * 100 : 0;
    if (algorithmDensity > 20) score += 25;
    else if (algorithmDensity > 10) score += 15;
    else if (algorithmDensity > 5) score += 10;
    
    // File coverage (analyzed vs total files)
    const fileCoverage = data.fileCounts.total > 0 ? (data.totalAnalyzedFiles / data.fileCounts.total) * 100 : 0;
    if (fileCoverage > 80) score += 25;
    else if (fileCoverage > 60) score += 15;
    else if (fileCoverage > 40) score += 10;
    
    // Language diversity
    const languageCount = Object.values(data.fileCounts).filter((count, index) => 
      index < 3 && count > 0 // javascript, python, typescript
    ).length;
    if (languageCount > 2) score += 25;
    else if (languageCount > 1) score += 15;
    else score += 5;
    
    // Repository size factor
    if (data.fileCounts.total > 50) score += 25;
    else if (data.fileCounts.total > 20) score += 15;
    else if (data.fileCounts.total > 10) score += 10;
    
    return Math.min(score, 100);
  };

  const getHealthBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score > 80) return "default";
    if (score > 60) return "secondary";
    return "destructive";
  };

  const getAlgorithmDensity = (): string => {
    if (!data || data.totalFunctions === 0) return "0%";
    return ((data.totalAlgorithms / data.totalFunctions) * 100).toFixed(1) + "%";
  };

  const getFileCoverage = (): string => {
    if (!data || data.fileCounts.total === 0) return "0%";
    return ((data.totalAnalyzedFiles / data.fileCounts.total) * 100).toFixed(1) + "%";
  };

  const getRepositorySize = (): string => {
    if (!data) return "Unknown";
    if (data.fileCounts.total > 100) return "Large";
    if (data.fileCounts.total > 30) return "Medium";
    return "Small";
  };

  const getAvgFunctionsPerFile = (): string => {
    if (!data || data.totalAnalyzedFiles === 0) return "0";
    return (data.totalFunctions / data.totalAnalyzedFiles).toFixed(1);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Loading repository analysis...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-destructive mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-destructive font-medium">{error}</p>
          </div>
          <Button
            onClick={() => loadRepositoryData()}
            className="mt-4"
            variant="destructive"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const healthScore = calculateHealthScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{data.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a
                  href={data.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                >
                  {data.githubUrl}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Analyzed: {formatDate(data.lastAnalyzed)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{healthScore}/100</div>
              <div className="text-muted-foreground text-sm">Health Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repository Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}/100</div>
            <Badge variant={getHealthBadgeVariant(healthScore)} className="mt-1">
              {healthScore > 80 ? "Excellent" : healthScore > 60 ? "Good" : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Algorithm Density</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getAlgorithmDensity()}</div>
            <p className="text-xs text-muted-foreground">{data.totalAlgorithms} of {data.totalFunctions} functions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Coverage</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getFileCoverage()}</div>
            <p className="text-xs text-muted-foreground">{data.totalAnalyzedFiles} of {data.fileCounts.total} files</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repository Size</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getRepositorySize()}</div>
            <p className="text-xs text-muted-foreground">{data.fileCounts.total} total files</p>
          </CardContent>
        </Card>
      </div>

      {/* Repository Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Functions:</span>
                <span className="font-medium">{data.totalFunctions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm Functions:</span>
                <span className="font-medium">{data.totalAlgorithms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analyzed Files:</span>
                <span className="font-medium">{data.totalAnalyzedFiles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Files:</span>
                <span className="font-medium">{data.fileCounts.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm Density:</span>
                <span className="font-medium">{getAlgorithmDensity()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Coverage:</span>
                <span className="font-medium">{getFileCoverage()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language Diversity:</span>
                <span className="font-medium">
                  {Object.values(data.fileCounts).filter((count, index) => index < 3 && count > 0).length} languages
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repository Size:</span>
                <span className="font-medium">{getRepositorySize()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Functions Per File:</span>
                <span className="font-medium">{getAvgFunctionsPerFile()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.fileCounts).filter(([key, value]) => key !== 'total' && value > 0).map(([language, count]) => (
              <Card key={language}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${getLanguageColor(language)}`}></div>
                    <div>
                      <h4 className="font-medium capitalize">{language}</h4>
                      <p className="text-muted-foreground text-sm">
                        {count} files ({((count / data.fileCounts.total) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryDetail;