'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

interface AnalysisPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AnalysisPanel({ isCollapsed = false, onToggleCollapse }: AnalysisPanelProps) {
  // Mock data for demonstration
  const metrics = {
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    linesOfCode: 23,
    cyclomaticComplexity: 4,
    maintainabilityIndex: 78
  };

  const flowSteps = [
    { id: 1, step: 'Initialize outer loop (i = 0 to n-1)', type: 'loop' },
    { id: 2, step: 'Initialize inner loop (j = 0 to n-i-1)', type: 'loop' },
    { id: 3, step: 'Compare arr[j] with arr[j+1]', type: 'condition' },
    { id: 4, step: 'Swap if arr[j] > arr[j+1]', type: 'action' },
    { id: 5, step: 'Continue inner loop', type: 'loop' },
    { id: 6, step: 'Continue outer loop', type: 'loop' },
    { id: 7, step: 'Return sorted array', type: 'return' }
  ];

  const pseudocode = `ALGORITHM BubbleSort
INPUT: Array arr of n elements
OUTPUT: Sorted array in ascending order

BEGIN
  FOR i = 0 TO n-2 DO
    FOR j = 0 TO n-i-2 DO
      IF arr[j] > arr[j+1] THEN
        SWAP arr[j] AND arr[j+1]
      END IF
    END FOR
  END FOR
  RETURN arr
END`;

  const getStepColor = (type: string) => {
    switch (type) {
      case 'loop': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'condition': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'action': return 'bg-green-100 border-green-300 text-green-800';
      case 'return': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full w-12">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="p-2">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="w-8 h-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Algorithm Analysis</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
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
                    <div className="text-2xl font-bold text-red-600">{metrics.timeComplexity}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Space Complexity</div>
                    <div className="text-2xl font-bold text-green-600">{metrics.spaceComplexity}</div>
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
                    <Badge>Sorting Algorithm</Badge>
                    <Badge variant="outline">Comparison-based</Badge>
                    <Badge variant="outline">In-place</Badge>
                    <Badge variant="outline">Stable</Badge>
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
                      <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                      <span>Loop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
                      <span>Condition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                      <span>Action</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></div>
                      <span>Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pseudocode" className="flex-1 mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Algorithm Pseudocode</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-line border">
                  {pseudocode}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Best Case</div>
                    <div className="text-muted-foreground">O(n) - Already sorted</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Worst Case</div>
                    <div className="text-muted-foreground">O(n²) - Reverse sorted</div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="font-medium mb-1 text-blue-800">Algorithm Notes</div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Simple comparison-based sorting algorithm</li>
                    <li>• Repeatedly steps through the list</li>
                    <li>• Compares adjacent elements and swaps them if wrong order</li>
                    <li>• Named for the way smaller elements "bubble" to the top</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}