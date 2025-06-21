'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAlgorithmWithAIAnalysis, analyzeFunctionWithAI, DatabaseAIAnalysis, AIAnalysisData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, Bot, FileText, GitBranch, Lightbulb, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from '@/components/MermaidDiagram';

interface AlgorithmDetail {
  id: string;
  name: string;
  type: string;
  start_line: number;
  end_line: number;
  line_count: number;
  code: string;
  is_algorithm: boolean;
  algorithm_score: number;
  classification_reason: string;
  file_analyses: {
    file_path: string;
    language: string;
  };
}

export default function AlgorithmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const algorithmId = params.id as string;
  
  const [algorithmDetail, setAlgorithmDetail] = useState<AlgorithmDetail | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | DatabaseAIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'pseudocode' | 'flowchart' | 'business'>('code');

  const loadAlgorithmDetail = useCallback(async () => {
    try {
      console.log('Loading algorithm detail for ID:', algorithmId);
      setLoading(true);
      setError(null);
      
      const result = await getAlgorithmWithAIAnalysis(algorithmId);
      console.log('Algorithm detail result:', result);
      setAlgorithmDetail(result as AlgorithmDetail);
      // Check if there are AI analyses and use the first one
      const resultWithAnalyses = result as { ai_analyses?: DatabaseAIAnalysis[] };
      if (resultWithAnalyses.ai_analyses && resultWithAnalyses.ai_analyses.length > 0) {
        setAiAnalysis(resultWithAnalyses.ai_analyses[0]);
      } else {
        setAiAnalysis(null);
      }
      
    } catch (err) {
      console.error('Error loading algorithm detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load algorithm details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [algorithmId]);

  useEffect(() => {
    loadAlgorithmDetail();
  }, [loadAlgorithmDetail]);

  const handleGenerateAIAnalysis = async () => {
    if (!algorithmDetail || loadingAI) return;
    
    try {
      setLoadingAI(true);
      setError(null);
      
      const analysis = await analyzeFunctionWithAI({
        functionCode: algorithmDetail.code,
        functionName: algorithmDetail.name,
        language: algorithmDetail.file_analyses.language,
        filePath: algorithmDetail.file_analyses.file_path,
        functionId: algorithmDetail.id, // Include function ID for database storage
        analysisType: 'comprehensive' // Always use comprehensive for algorithms
      });
      
      setAiAnalysis(analysis);
      setActiveTab('analysis');
      
    } catch (err) {
      setError('Failed to generate AI analysis');
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Helper function to check if analysis has enhanced LangChain data
  const isEnhancedAnalysis = (analysis: DatabaseAIAnalysis | AIAnalysisData | null): analysis is AIAnalysisData => {
    return Boolean(analysis && (
      (analysis as AIAnalysisData).shortDescription !== undefined ||
      (analysis as AIAnalysisData).businessValue !== undefined ||
      (analysis as AIAnalysisData).overallAssessment !== undefined
    ));
  };

  const getCleanPath = (path: string) => {
    const match = path.match(/T\/[^\/]+\/(.*)/);
    if (match && match[1]) {
      return match[1];
    }
    return path;
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

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return { variant: 'default' as const, label: 'High Confidence', color: 'text-green-600' };
    if (score >= 0.6) return { variant: 'secondary' as const, label: 'Medium Confidence', color: 'text-yellow-600' };
    return { variant: 'outline' as const, label: 'Low Confidence', color: 'text-red-600' };
  };

  const getComplexityLevel = (lineCount: number) => {
    if (lineCount > 100) return { level: 'High', color: 'text-red-600', icon: AlertTriangle };
    if (lineCount > 50) return { level: 'Medium', color: 'text-yellow-600', icon: TrendingUp };
    return { level: 'Low', color: 'text-green-600', icon: Zap };
  };

  if (loading) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Algorithm Details
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Loading algorithm details...</span>
        </div>
      </main>
    );
  }

  if (error || !algorithmDetail) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Algorithm Details
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center text-red-500">
          {error || 'Algorithm not found'}
        </div>
      </main>
    );
  }

  const scoreBadge = getScoreBadge(algorithmDetail.algorithm_score);
  const complexity = getComplexityLevel(algorithmDetail.line_count);
  const ComplexityIcon = complexity.icon;

  return (
    <main className="h-full flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-2xl text-foreground flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-500" />
              {algorithmDetail.name}
            </h1>
            <p className="text-muted-foreground">
              {getCleanPath(algorithmDetail.file_analyses.file_path)} • Lines {algorithmDetail.start_line}-{algorithmDetail.end_line}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Recursion Detection Badge */}
          {algorithmDetail.classification_reason && algorithmDetail.classification_reason.includes('recursion detected') && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">
              <GitBranch className="h-3 w-3 mr-1" />
              Recursion Detected
            </Badge>
          )}
          
          {!aiAnalysis && (
            <Button 
              onClick={handleGenerateAIAnalysis}
              disabled={loadingAI}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loadingAI ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  AI Analysis
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Algorithm Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Algorithm Score</p>
                <p className={`text-2xl font-bold ${scoreBadge.color}`}>
                  {(algorithmDetail.algorithm_score * 100).toFixed(0)}%
                </p>
              </div>
              <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Complexity</p>
                <p className={`text-lg font-semibold ${complexity.color} flex items-center gap-1`}>
                  <ComplexityIcon className="h-4 w-4" />
                  {complexity.level}
                </p>
              </div>
              <div className="text-muted-foreground">
                <p className="text-sm">{algorithmDetail.line_count} lines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <Badge className={`${getLanguageColor(algorithmDetail.file_analyses.language)} text-white`}>
                  {algorithmDetail.file_analyses.language.toUpperCase()}
                </Badge>
              </div>
              <Code className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-lg font-semibold capitalize">{algorithmDetail.type}</p>
              </div>
              <GitBranch className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classification Reason - Only show if not recursion (recursion is now in header) */}
      {algorithmDetail.classification_reason && !algorithmDetail.classification_reason.includes('recursion detected') && (
        <Card className="shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Algorithm Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border-l-4 border-blue-500">
              {algorithmDetail.classification_reason}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'code' | 'analysis' | 'pseudocode' | 'flowchart' | 'business')}>
            <TabsList>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Algorithm Code
              </TabsTrigger>
              {aiAnalysis && (
                <>
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Analysis
                  </TabsTrigger>
                  <TabsTrigger value="pseudocode" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Pseudocode
                  </TabsTrigger>
                  <TabsTrigger value="flowchart" className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Flowchart
                  </TabsTrigger>
                  {isEnhancedAnalysis(aiAnalysis) && aiAnalysis.businessValue && (
                    <TabsTrigger value="business" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Business Impact
                    </TabsTrigger>
                  )}
                </>
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full overflow-hidden">
            {activeTab === 'code' && (
              <div className="h-full overflow-auto">
                <pre className="p-4 bg-gray-900 text-gray-100 text-sm h-full overflow-auto">
                  <code>{algorithmDetail.code}</code>
                </pre>
              </div>
            )}

            {activeTab === 'analysis' && aiAnalysis && (
              <div className="p-6 h-full overflow-auto space-y-6">
                {isEnhancedAnalysis(aiAnalysis) && aiAnalysis.shortDescription && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-500" />
                      Algorithm Overview
                    </h3>
                    <p className="text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
                      {aiAnalysis.shortDescription}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Complexity Analysis</h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiAnalysis.complexityAnalysis}
                    </ReactMarkdown>
                  </div>
                </div>

                {aiAnalysis.optimizationSuggestions?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-600 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Optimization Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.optimizationSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.potentialIssues?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Potential Issues
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.potentialIssues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isEnhancedAnalysis(aiAnalysis) && aiAnalysis.overallAssessment && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overall Assessment</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiAnalysis.overallAssessment}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pseudocode' && aiAnalysis && (
              <div className="h-full overflow-auto">
                <pre className="p-4 bg-green-950 text-green-100 text-sm h-full overflow-auto font-mono whitespace-pre-wrap">
                  {aiAnalysis.pseudocode}
                </pre>
              </div>
            )}

            {activeTab === 'flowchart' && aiAnalysis && (
              <div className="p-6 h-full overflow-auto">
                <MermaidDiagram chart={aiAnalysis.flowchart} />
              </div>
            )}

            {activeTab === 'business' && aiAnalysis && isEnhancedAnalysis(aiAnalysis) && (
              <div className="p-6 h-full overflow-auto space-y-6">
                {aiAnalysis.businessValue && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-purple-600 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Business Value
                    </h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiAnalysis.businessValue}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {aiAnalysis.useCases && aiAnalysis.useCases.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
                    <ul className="space-y-2">
                      {aiAnalysis.useCases.map((useCase, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0" />
                          <span className="text-sm">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.performanceImpact && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Performance Impact</h3>
                    <p className="text-sm bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border-l-4 border-yellow-500">
                      {aiAnalysis.performanceImpact}
                    </p>
                  </div>
                )}

                {aiAnalysis.scalabilityNotes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Scalability Notes</h3>
                    <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
                      {aiAnalysis.scalabilityNotes}
                    </p>
                  </div>
                )}

                {aiAnalysis.maintenanceComplexity && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Maintenance Complexity</h3>
                    <p className="text-sm bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
                      {aiAnalysis.maintenanceComplexity}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}