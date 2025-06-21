'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from "@/components/ui/progress";
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, GitBranch, FileText, Target } from 'lucide-react';
import { useChatContext } from '../contexts/ChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AnalysisPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AnalysisPanel({ isCollapsed = false, onToggleCollapse }: AnalysisPanelProps) {
  const { selectedAlgorithm } = useChatContext();
  
  // Extract data from selected algorithm or use defaults
  const algorithm = selectedAlgorithm?.algorithm;
  const aiAnalysis = selectedAlgorithm?.aiAnalysis;
  
  const metrics = {
    timeComplexity: aiAnalysis?.complexityAnalysis?.match(/Time.*?O\([^)]+\)/i)?.[0] || 'Not analyzed',
    spaceComplexity: aiAnalysis?.complexityAnalysis?.match(/Space.*?O\([^)]+\)/i)?.[0] || 'Not analyzed',
    linesOfCode: algorithm?.line_count || 0,
    cyclomaticComplexity: 4, // This would need to be calculated or provided by backend
    maintainabilityIndex: 78 // This would need to be calculated or provided by backend
  };

  // Generate flow steps from flowchart data if available
  const flowSteps = aiAnalysis?.flowchart ? 
    aiAnalysis.flowchart.split('\n')
      .filter(line => line.trim())
      .map((step, index) => ({
        id: index + 1,
        step: step.trim(),
        type: step.toLowerCase().includes('loop') ? 'loop' :
              step.toLowerCase().includes('if') || step.toLowerCase().includes('condition') ? 'condition' :
              step.toLowerCase().includes('return') ? 'return' : 'action'
      })) : 
    [{ id: 1, step: 'No flow diagram available. Select an algorithm using @ in the chat.', type: 'action' }];

  const pseudocode = aiAnalysis?.pseudocode || 
    'No pseudocode available. Select an algorithm using @ in the chat to see its pseudocode.';

  const getStepColor = (type: string) => {
    switch (type) {
      case 'loop': return 'bg-muted/50 border-border';
      case 'condition': return 'bg-muted/70 border-border';
      case 'action': return 'bg-muted/30 border-border';
      case 'return': return 'bg-muted/60 border-border';
      default: return 'bg-muted/40 border-border';
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full w-12 transition-all duration-500 ease-in-out">
        <Card className="flex-1 flex flex-col transition-all duration-500 ease-in-out">
          <CardHeader className="p-2">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="w-8 h-8 p-0 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <BarChart3 className="h-4 w-4 text-muted-foreground transition-all duration-300" />
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full transition-all duration-500 ease-in-out transform">
      <Card className="flex-1 flex flex-col transition-all duration-500 ease-in-out">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg transition-all duration-300">
              {algorithm ? `${algorithm.name} Analysis` : 'Algorithm Analysis'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-8 h-8 p-0 transition-all duration-300 hover:scale-110 hover:bg-muted/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {algorithm && (
            <div className="text-sm text-muted-foreground">
              {algorithm.type} • Lines {algorithm.start_line}-{algorithm.end_line}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-4 transition-all duration-500 ease-in-out">
          {!algorithm ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
              <div className="max-w-md w-full">
                <Card className="border-dashed border-2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="rounded-full bg-muted p-3">
                        <BarChart3 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          Analysis Ready
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Use <Badge variant="secondary" className="font-mono text-xs px-2 py-1">@</Badge> in chat to analyze algorithms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 hover:shadow-sm transition-all duration-200 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-blue-100 p-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">Metrics</span>
                    </div>
                  </Card>
                  <Card className="p-4 hover:shadow-sm transition-all duration-200 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <GitBranch className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-sm">Flow</span>
                    </div>
                  </Card>
                  <Card className="p-4 hover:shadow-sm transition-all duration-200 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-purple-100 p-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-sm">Pseudocode</span>
                    </div>
                  </Card>
                  <Card className="p-4 hover:shadow-sm transition-all duration-200 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-orange-100 p-2">
                        <Target className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-sm">Quality</span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="flow">Flow Diagram</TabsTrigger>
                <TabsTrigger value="pseudocode">Pseudocode</TabsTrigger>
              </TabsList>
            
            <TabsContent value="metrics" className="flex-1 mt-4 space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Time Complexity</div>
                    <div className="text-2xl font-bold">{metrics.timeComplexity}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Space Complexity</div>
                    <div className="text-2xl font-bold">{metrics.spaceComplexity}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lines of Code</span>
                    <Badge variant="secondary">{metrics.linesOfCode}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cyclomatic Complexity</span>
                      <span className="text-sm text-muted-foreground">{metrics.cyclomaticComplexity}/10</span>
                    </div>
                    <Progress value={metrics.cyclomaticComplexity * 10} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Maintainability Index</span>
                      <span className="text-sm text-muted-foreground">{metrics.maintainabilityIndex}/100</span>
                    </div>
                    <Progress value={metrics.maintainabilityIndex} className="h-2" />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Algorithm Classification</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Score: {algorithm?.algorithm_score?.toFixed(2) || 'N/A'}
                    </Badge>
                    {algorithm?.classification_reason && (
                      <Badge variant="outline">
                        {algorithm.classification_reason}
                      </Badge>
                    )}
                    {algorithm?.is_algorithm && (
                      <Badge variant="outline">Algorithm</Badge>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="flow" className="flex-1 mt-4">
              <div className="space-y-3">
                <h4 className="font-medium mb-4">Algorithm Flow</h4>
                <div className="space-y-2">
                  {flowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg border-2 ${getStepColor(step.type)}`}>
                        <div className="text-sm font-medium">{step.step}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {step.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-medium mb-2">Flow Legend</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/50 border border-border"></div>
                      <span>Loop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/70 border border-border"></div>
                      <span>Condition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/30 border border-border"></div>
                      <span>Action</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted/60 border border-border"></div>
                      <span>Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pseudocode" className="flex-1 mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Pseudocode</h4>
                  <div className="bg-muted p-4 rounded-lg text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {pseudocode}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {aiAnalysis?.complexityAnalysis && (
                  <div>
                    <h4 className="font-medium mb-2">Complexity Analysis</h4>
                    <div className="text-sm text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiAnalysis.complexityAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {algorithm?.classification_reason && (
                  <div>
                    <h4 className="font-medium mb-2">Algorithm Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {algorithm.classification_reason}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}