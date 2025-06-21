'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFunctionWithAIAnalysis, analyzeFunctionWithAI, DatabaseAIAnalysis, AIAnalysisData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, Bot, FileText, GitBranch, Lightbulb, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from '@/components/MermaidDiagram';

interface FunctionDetail {
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

export default function FunctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const functionId = params.id as string;
  
  const [functionDetail, setFunctionDetail] = useState<FunctionDetail | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | DatabaseAIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'pseudocode' | 'flowchart' | 'business'>('code');

  const loadFunctionDetail = useCallback(async () => {
    try {
      console.log('Loading function detail for ID:', functionId);
      setLoading(true);
      setError(null);
      
      const result = await getFunctionWithAIAnalysis(functionId);
      console.log('Function detail result:', result);
      setFunctionDetail(result as FunctionDetail);
      // Check if there are AI analyses and use the first one
      const resultWithAnalyses = result as { ai_analyses?: DatabaseAIAnalysis[] };
      if (resultWithAnalyses.ai_analyses && resultWithAnalyses.ai_analyses.length > 0) {
        setAiAnalysis(resultWithAnalyses.ai_analyses[0]);
      } else {
        setAiAnalysis(null);
      }
      
    } catch (err) {
      console.error('Error loading function detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load function details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [functionId]);

  useEffect(() => {
    loadFunctionDetail();
  }, [loadFunctionDetail]);

  const handleGenerateAIAnalysis = async () => {
    if (!functionDetail || loadingAI) return;
    
    try {
      setLoadingAI(true);
      setError(null);
      
      const analysis = await analyzeFunctionWithAI({
        functionCode: functionDetail.code,
        functionName: functionDetail.name,
        language: functionDetail.file_analyses.language,
        filePath: functionDetail.file_analyses.file_path,
        functionId: functionDetail.id, // Include function ID for database storage
        analysisType: functionDetail.is_algorithm ? 'comprehensive' : 'quick_assessment'
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
            Function Details
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Loading function details...</span>
        </div>
      </main>
    );
  }

  if (error || !functionDetail) {
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
            Function Details
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center text-red-500">
          {error || 'Function not found'}
        </div>
      </main>
    );
  }

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
            <h1 className="text-lg font-semibold md:text-2xl text-foreground">
              {functionDetail.name}
            </h1>
            <p className="text-muted-foreground">
              {getCleanPath(functionDetail.file_analyses.file_path)}
            </p>
          </div>
        </div>
        {!aiAnalysis && (
          <Button 
            onClick={handleGenerateAIAnalysis} 
            disabled={loadingAI}
            className="shrink-0"
          >
            <Bot className="h-4 w-4 mr-2" />
            {loadingAI ? 'Generating...' : 'AI Analysis'}
          </Button>
        )}
      </div>

      {/* Function Metadata */}
      <Card className="shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Function Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getLanguageColor(functionDetail.file_analyses.language)} text-white`}>
                {functionDetail.file_analyses.language}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={functionDetail.algorithm_score > 0.5 ? "default" : "secondary"}>
                {functionDetail.algorithm_score > 0.5 ? "Algorithm" : "Function"}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Lines: {functionDetail.start_line}-{functionDetail.end_line} ({functionDetail.line_count} total)
            </div>
            <div className="text-sm text-muted-foreground">
              Score: <span className={functionDetail.algorithm_score > 0.5 ? "font-semibold text-primary" : ""}>
                {functionDetail.algorithm_score.toFixed(2)}
              </span>
            </div>
          </div>
          {functionDetail.classification_reason && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Classification Reason:</strong> {functionDetail.classification_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="pb-3 shrink-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'code' | 'analysis' | 'pseudocode' | 'flowchart' | 'business')} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="code" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="analysis" disabled={!aiAnalysis} className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="pseudocode" disabled={!aiAnalysis} className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Pseudocode
              </TabsTrigger>
              <TabsTrigger value="flowchart" disabled={!aiAnalysis} className="flex items-center">
                <GitBranch className="h-4 w-4 mr-2" />
                Flowchart
              </TabsTrigger>
              <TabsTrigger value="business" disabled={!aiAnalysis} className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Business Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 overflow-hidden pt-0">
          <div className="h-full overflow-auto">
            {activeTab === 'code' && (
              <div className="bg-muted/50 border border-border text-foreground p-4 rounded-md font-mono text-sm overflow-auto h-full">
                <pre className="whitespace-pre-wrap">{functionDetail.code}</pre>
              </div>
            )}
            
            {activeTab === 'analysis' && aiAnalysis && (
              <div className="prose prose-sm max-w-none h-full overflow-auto dark:prose-invert">
                {/* Business Analysis Section - Show if available */}
                {isEnhancedAnalysis(aiAnalysis) && (
                  <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100 flex items-center">
                      <Bot className="h-5 w-5 mr-2" />
                      Business Analysis
                    </h3>
                    
                    {/* Business Description */}
                    <div className="mb-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Description</h4>
                      <p className="text-blue-700 dark:text-blue-300">
                        {aiAnalysis.shortDescription}
                      </p>
                    </div>
                    
                    {/* Enhanced Business Fields */}
                    {aiAnalysis.businessValue && (
                      <div className="mb-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Business Value</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                          {aiAnalysis.businessValue}
                        </p>
                      </div>
                    )}
                    
                    {aiAnalysis.useCases && aiAnalysis.useCases.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Use Cases</h4>
                        <ul className="list-disc list-inside text-blue-700 dark:text-blue-300">
                          {aiAnalysis.useCases.map((useCase, index) => (
                            <li key={index}>{useCase}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {aiAnalysis.performanceImpact && (
                      <div className="mb-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Performance Impact</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                          {aiAnalysis.performanceImpact}
                        </p>
                      </div>
                    )}
                    
                    {aiAnalysis.scalabilityNotes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Scalability Notes</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                          {aiAnalysis.scalabilityNotes}
                        </p>
                      </div>
                    )}
                    
                    {aiAnalysis.maintenanceComplexity && (
                      <div className="mb-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Maintenance Complexity</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                          {aiAnalysis.maintenanceComplexity}
                        </p>
                      </div>
                    )}
                    
                    {/* Legacy Business Metrics - Show if available */}
                    {aiAnalysis.businessAnalysis?.businessMetrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {aiAnalysis.businessAnalysis.businessMetrics.complexityScore}/10
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Complexity</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {aiAnalysis.businessAnalysis.businessMetrics.businessImpact}/10
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Business Impact</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {aiAnalysis.businessAnalysis.businessMetrics.maintenanceRisk}/10
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Maintenance Risk</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {aiAnalysis.businessAnalysis.businessMetrics.performanceRisk}/10
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Performance Risk</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Business Info from legacy format */}
                    {aiAnalysis.businessAnalysis?.businessMetrics && (
                      aiAnalysis.businessAnalysis.businessMetrics.algorithmType || 
                      aiAnalysis.businessAnalysis.businessMetrics.businessDomain || 
                      aiAnalysis.businessAnalysis.businessMetrics.priorityLevel
                    ) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiAnalysis.businessAnalysis.businessMetrics.algorithmType && (
                          <div>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Algorithm Type:</span>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              {aiAnalysis.businessAnalysis.businessMetrics.algorithmType}
                            </div>
                          </div>
                        )}
                        {aiAnalysis.businessAnalysis.businessMetrics.businessDomain && (
                          <div>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Business Domain:</span>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              {aiAnalysis.businessAnalysis.businessMetrics.businessDomain}
                            </div>
                          </div>
                        )}
                        {aiAnalysis.businessAnalysis.businessMetrics.priorityLevel && (
                          <div>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Priority Level:</span>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              {aiAnalysis.businessAnalysis.businessMetrics.priorityLevel}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Recommendations */}
                {isEnhancedAnalysis(aiAnalysis) && aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical Analysis */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Technical Analysis</h3>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiAnalysis.complexityAnalysis}
                  </ReactMarkdown>
                </div>

                {/* Optimization Suggestions */}
                {aiAnalysis.optimizationSuggestions && aiAnalysis.optimizationSuggestions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-green-500" />
                      Optimization Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.optimizationSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Issues */}
                {aiAnalysis.potentialIssues && aiAnalysis.potentialIssues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                      Potential Issues
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.potentialIssues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'pseudocode' && aiAnalysis && (
              <div className="h-full overflow-auto">
                <pre className="bg-gray-900 dark:bg-gray-800 text-green-400 dark:text-green-300 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto">
                  {aiAnalysis.pseudocode}
                </pre>
              </div>
            )}
            
            {activeTab === 'flowchart' && aiAnalysis && (
              <div className="h-full overflow-auto">
                <MermaidDiagram chart={aiAnalysis.flowchart} />
              </div>
            )}
            
            {activeTab === 'business' && aiAnalysis && (
              <div className="prose prose-sm max-w-none h-full overflow-auto dark:prose-invert">
                {isEnhancedAnalysis(aiAnalysis) && aiAnalysis.overallAssessment ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiAnalysis.overallAssessment}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Business analysis not available for this function.</p>
                    <p className="text-sm mt-2">Try generating a comprehensive AI analysis to get business insights.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 