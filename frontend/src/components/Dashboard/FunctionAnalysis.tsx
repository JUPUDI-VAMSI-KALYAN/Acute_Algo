'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnalysisData, FunctionInfo, analyzeFunctionWithAI, AIAnalysisData } from '../../lib/api';
import MermaidDiagram from '../MermaidDiagram';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Search } from 'lucide-react';
import { DataTablePagination } from './DataTablePagination';

interface FunctionAnalysisProps {
  data: AnalysisData;
}

const DetailedFunctionView: React.FC<{
  functionInfo: FunctionInfo;
  filePath: string;
  functionCode: string;
  onClose: () => void;
}> = ({ functionInfo, filePath, functionCode, onClose }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'pseudocode' | 'flowchart' | 'analysis'>('code');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | null>(functionInfo?.aiAnalysis || null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIAnalysis = async () => {
    if (isLoadingAI) return;
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
      let language = 'unknown';
      if (fileExtension === 'py') language = 'python';
      else if (['js', 'jsx'].includes(fileExtension)) language = 'javascript';
      else if (['ts', 'tsx'].includes(fileExtension)) language = 'typescript';
      const analysis = await analyzeFunctionWithAI({
        functionCode,
        functionName: functionInfo.name,
        language,
        filePath,
      });
      setAiAnalysis(analysis);
      setActiveTab('analysis');
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI analysis failed');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>{functionInfo.name}</CardTitle>
                <CardDescription>{filePath} (Lines: {functionInfo.startLine}-{functionInfo.endLine})</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-1">
                {['code', 'pseudocode', 'flowchart', 'analysis'].map(tab => (
                    <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab as 'code' | 'pseudocode' | 'flowchart' | 'analysis')} disabled={!aiAnalysis && tab !== 'code'}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                ))}
            </div>
            {!aiAnalysis && (
                <Button onClick={handleAIAnalysis} disabled={isLoadingAI}>
                    {isLoadingAI ? 'Analyzing...' : '🤖 AI Analysis'}
                </Button>
            )}
        </div>

        {aiError && <p className="text-red-500">{aiError}</p>}
        
        <div className="p-4 border rounded-md bg-gray-900 text-white min-h-[300px]">
            {activeTab === 'code' && <pre><code>{functionCode}</code></pre>}
            {activeTab === 'pseudocode' && aiAnalysis && (
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                {aiAnalysis.pseudocode}
              </pre>
            )}
            {activeTab === 'flowchart' && aiAnalysis && <MermaidDiagram chart={aiAnalysis.flowchart} />}
            {activeTab === 'analysis' && aiAnalysis && (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis.complexityAnalysis}</ReactMarkdown>
                {aiAnalysis.optimizationSuggestions.length > 0 && (
                    <>
                        <h3>Optimization Suggestions</h3>
                        <ul>
                            {aiAnalysis.optimizationSuggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </>
                )}
                {aiAnalysis.potentialIssues.length > 0 && (
                    <>
                        <h3>Potential Issues</h3>
                        <ul>
                            {aiAnalysis.potentialIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </>
                )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export const FunctionAnalysis: React.FC<FunctionAnalysisProps> = ({ data }) => {
  const [selectedFunction, setSelectedFunction] = useState<FunctionInfo | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [functionCode, setFunctionCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const getCleanPath = (path: string) => {
    // This regex looks for the temporary directory pattern /T/a-random-hash/ and captures everything after it.
    const match = path.match(/T\/[^\/]+\/(.*)/);
    if (match && match[1]) {
      return match[1];
    }
    return path;
  };

  const allFunctions = useMemo(() => {
    if (!data.functionAnalysis || !data.functionAnalysis.files) return [];
    return data.functionAnalysis.files.flatMap(file =>
      file.functions.map(func => ({
        ...func,
        language: file.language,
        filePath: file.path,
      }))
    );
  }, [data]);

  const filteredFunctions = useMemo(() => {
    return allFunctions.filter(func => func.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allFunctions, searchTerm]);

  const paginatedFunctions = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredFunctions.slice(start, end);
  }, [filteredFunctions, page, perPage]);

  const handleFunctionClick = (func: FunctionInfo & {filePath: string, language: string}) => {
    setSelectedFunction(func);
    setSelectedFilePath(func.filePath);
    setFunctionCode(func.code || `Code for ${func.name} not provided by the backend.`);
  };
  
  if (selectedFunction) {
    return <DetailedFunctionView functionInfo={selectedFunction} filePath={selectedFilePath} functionCode={functionCode} onClose={() => setSelectedFunction(null)} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Analysis</CardTitle>
        <CardDescription>
          Explore all {allFunctions.length} functions detected in the repository.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by function name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Placeholder for column visibility toggles */}
                    <DropdownMenuCheckboxItem checked>Name</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Language</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>File Path</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Lines</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>File Path</TableHead>
                        <TableHead>Lines</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedFunctions.map((func) => (
                        <TableRow key={`${func.filePath}-${func.name}-${func.startLine}`} onClick={() => handleFunctionClick(func)} className="cursor-pointer">
                            <TableCell className="font-medium">{func.name}</TableCell>
                            <TableCell>{func.language}</TableCell>
                            <TableCell>{getCleanPath(func.filePath)}</TableCell>
                            <TableCell>{func.startLine} - {func.endLine}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="mt-4">
            <DataTablePagination
                page={page}
                count={filteredFunctions.length}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
            />
        </div>
      </CardContent>
    </Card>
  );
}; 