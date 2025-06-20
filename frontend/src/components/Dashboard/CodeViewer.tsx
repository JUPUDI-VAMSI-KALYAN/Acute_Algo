'use client';

import React, { useState } from 'react';
import { AnalysisData, copyToClipboard } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode, Copy, Expand, Minimize2 } from 'lucide-react';

interface CodeViewerProps {
  analysisData: AnalysisData;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ analysisData }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleCopyAll = async () => {
    setCopyStatus('copying');
    
    try {
      const success = await copyToClipboard(analysisData.fileContents);
      if (success) {
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 3000);
      } else {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 3000);
      }
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'copying': return 'Copying...';
      case 'success': return 'Copied!';
      case 'error': return 'Failed';
      default: return 'Copy All Files';
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileCode className="h-5 w-5" />
                <span>Code Files</span>
              </CardTitle>
              <CardDescription>
                All source code from {analysisData.repositoryName}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {formatNumber(analysisData.totalCharacters)} characters
              </Badge>
              <Button
                onClick={handleCopyAll}
                disabled={copyStatus === 'copying'}
                variant={getStatusVariant(copyStatus)}
                size="sm"
              >
                <Copy className="mr-2 h-4 w-4" />
                {getStatusText(copyStatus)}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Code Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Characters</CardTitle>
            <span className="text-lg">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analysisData.totalCharacters)}</div>
            <p className="text-xs text-muted-foreground">Total in codebase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <span className="text-lg">📄</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisData.fileCounts.total}</div>
            <p className="text-xs text-muted-foreground">Analyzed files</p>
          </CardContent>
        </Card>

        {analysisData.functionAnalysis && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Functions</CardTitle>
                <span className="text-lg">⚡</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisData.functionAnalysis.totalFunctions}</div>
                <p className="text-xs text-muted-foreground">Detected functions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg/File</CardTitle>
                <span className="text-lg">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisData.functionAnalysis.avgFunctionsPerFile}</div>
                <p className="text-xs text-muted-foreground">Functions per file</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Code Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span className="text-lg">💻</span>
              <span>Source Code</span>
            </CardTitle>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <Expand className="mr-2 h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="bg-muted rounded-lg overflow-hidden">
            <div className={`text-foreground font-mono text-sm overflow-x-auto ${
              isExpanded ? 'max-h-none' : 'max-h-96'
            } overflow-y-auto`}>
              {analysisData.fileContents ? (
                <pre className="p-4 whitespace-pre-wrap bg-gray-900 text-gray-100 rounded-lg">
                  {analysisData.fileContents}
                </pre>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="text-2xl mb-2 block">📄</span>
                  <p>No code files found or content not available.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        {!isExpanded && analysisData.fileContents && (
          <CardContent className="pt-0">
            <div className="text-center">
              <Button
                onClick={() => setIsExpanded(true)}
                variant="ghost"
                size="sm"
              >
                Show full content
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}; 