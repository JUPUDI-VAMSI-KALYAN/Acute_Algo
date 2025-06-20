'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFunctionWithAIAnalysis, analyzeFunctionWithAI, DatabaseAIAnalysis } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, Bot, FileText, GitBranch } from 'lucide-react';
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
  const [aiAnalysis, setAiAnalysis] = useState<DatabaseAIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'pseudocode' | 'flowchart'>('code');

  useEffect(() => {
    loadFunctionDetail();
  }, [functionId]);

  const loadFunctionDetail = async () => {
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
  };

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
      });
      
      // Convert to DatabaseAIAnalysis format
      const dbAnalysis: DatabaseAIAnalysis = {
        id: `generated-${functionDetail.id}`,
        functionId: functionDetail.id,
        pseudocode: analysis.pseudocode,
        flowchart: analysis.flowchart,
        complexityAnalysis: analysis.complexityAnalysis,
        optimizationSuggestions: analysis.optimizationSuggestions,
        potentialIssues: analysis.potentialIssues,
        createdAt: new Date().toISOString(),
      };
      
      setAiAnalysis(dbAnalysis);
      setActiveTab('analysis');
      
    } catch (err) {
      setError('Failed to generate AI analysis');
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'code' | 'analysis' | 'pseudocode' | 'flowchart')} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiAnalysis.complexityAnalysis}
                </ReactMarkdown>
                
                {aiAnalysis.optimizationSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Optimization Suggestions</h3>
                    <ul className="space-y-2">
                      {aiAnalysis.optimizationSuggestions.map((suggestion, index) => (
                        <li key={index} className="p-3 bg-green-500/10 border-l-4 border-green-500 rounded text-foreground">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysis.potentialIssues.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Potential Issues</h3>
                    <ul className="space-y-2">
                      {aiAnalysis.potentialIssues.map((issue, index) => (
                        <li key={index} className="p-3 bg-red-500/10 border-l-4 border-red-500 rounded text-foreground">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'pseudocode' && aiAnalysis && (
              <div className="prose prose-sm max-w-none h-full overflow-auto dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiAnalysis.pseudocode}
                </ReactMarkdown>
              </div>
            )}
            
            {activeTab === 'flowchart' && aiAnalysis && (
              <div className="h-full overflow-auto">
                <MermaidDiagram chart={aiAnalysis.flowchart} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 