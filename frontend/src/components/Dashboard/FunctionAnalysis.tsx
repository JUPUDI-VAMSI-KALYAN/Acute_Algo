import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnalysisData, FunctionInfo, copyToClipboard, analyzeFunctionWithAI, AIAnalysisData, getAIServiceStatus } from '../../lib/api';
import MermaidDiagram from '../MermaidDiagram';


interface FunctionAnalysisProps {
  data: AnalysisData;
}

interface DetailedFunctionViewProps {
  isOpen: boolean;
  onClose: () => void;
  functionInfo: FunctionInfo | null;
  filePath: string;
  functionCode: string;
}



const DetailedFunctionView: React.FC<DetailedFunctionViewProps> = ({
  isOpen,
  onClose,
  functionInfo,
  filePath,
  functionCode
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'pseudocode' | 'flowchart' | 'analysis'>('code');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | null>(functionInfo?.aiAnalysis || null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);

  // Check AI service status on component mount
  React.useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const status = await getAIServiceStatus();
        setAiServiceAvailable(status.available);
      } catch {
        setAiServiceAvailable(false);
      }
    };
    checkAIStatus();
  }, []);

  const handleCopyCode = async () => {
    setCopyStatus('copying');
    try {
      const success = await copyToClipboard(functionCode);
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

  const handleAIAnalysis = async () => {
    if (!functionInfo || !functionCode || isLoadingAI) return;

    setIsLoadingAI(true);
    setAiError(null);

    try {
      // Determine language from file path
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      let language = 'unknown';
      if (fileExtension === 'py') language = 'python';
      else if (['js', 'jsx'].includes(fileExtension || '')) language = 'javascript';
      else if (['ts', 'tsx'].includes(fileExtension || '')) language = 'typescript';

      const analysis = await analyzeFunctionWithAI({
        functionCode,
        functionName: functionInfo.name,
        language,
        filePath
      });

      setAiAnalysis(analysis);
      setActiveTab('pseudocode'); // Switch to pseudocode tab after analysis
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI analysis failed');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'copying': return 'Copying...';
      case 'success': return 'Copied!';
      case 'error': return 'Failed';
      default: return 'Copy Code';
    }
  };

  // Extract meaningful path (remove temp directory prefix)
  const getCleanPath = (path: string) => {
    const parts = path.split('/');
    // Find the actual project part (usually after a temp directory)
    const projectIndex = parts.findIndex(part => part.includes('-') && !part.startsWith('tmp') && !part.startsWith('var'));
    if (projectIndex > 0 && projectIndex < parts.length - 1) {
      return parts.slice(projectIndex).join('/');
    }
    // Fallback: show last 3-4 meaningful parts
    return parts.slice(-4).join('/');
  };

  if (!isOpen || !functionInfo) return null;

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{functionInfo.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-mono">{getCleanPath(filePath)}</span> • Lines {functionInfo.startLine}-{functionInfo.endLine} • {functionInfo.type}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'code' && (
              <button
                onClick={handleCopyCode}
                disabled={copyStatus === 'copying'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copyStatus === 'copying' 
                    ? 'bg-gray-100 text-gray-400' 
                    : copyStatus === 'success' 
                    ? 'bg-green-600 text-white' 
                    : copyStatus === 'error' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {getStatusText(copyStatus)}
              </button>
            )}
            
            {aiServiceAvailable && !aiAnalysis && (
              <button
                onClick={handleAIAnalysis}
                disabled={isLoadingAI}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLoadingAI
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isLoadingAI ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    🤖 AI Analysis
                  </span>
                )}
              </button>
            )}

            {aiAnalysis && (
              <div className="flex items-center px-3 py-1 bg-green-50 rounded-full text-sm text-green-700">
                <span className="mr-1">✅</span>
                Analysis Complete
              </div>
            )}

            {aiError && (
              <div className="flex items-center text-sm text-red-600">
                <span className="mr-1">❌</span>
                {aiError}
              </div>
            )}

            {!aiServiceAvailable && (
              <div className="flex items-center text-sm text-yellow-600">
                <span className="mr-1">⚠️</span>
                AI Service Not Available
              </div>
            )}
          </div>
        </div>

        {/* Main content tabs */}
        <div className="mt-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'code' as const, name: 'Code', icon: '💻' },
              { id: 'pseudocode' as const, name: 'Pseudocode', icon: '📝', disabled: !aiAnalysis },
              { id: 'flowchart' as const, name: 'Flowchart', icon: '🔄', disabled: !aiAnalysis },
              { id: 'analysis' as const, name: 'Analysis', icon: '🤖', disabled: !aiAnalysis }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 py-3 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  tab.disabled
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Layout - Full width optimized */}
      <div className="w-full">
        {/* Main Content Area - Full width */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'code' && (
            <div className="h-[70vh] min-h-[500px] max-h-[900px]">
              <div className="h-full bg-gray-900 rounded-xl overflow-hidden">
                <div className="h-full overflow-auto">
                  <pre className="text-green-400 text-sm font-mono p-4 whitespace-pre-wrap min-h-full">
                    <code>{functionCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pseudocode' && (
            <div className="h-[70vh] min-h-[500px] max-h-[900px] p-4">
              {aiAnalysis ? (
                <div className="h-full overflow-auto">
                  <div className="bg-white p-4 rounded border border-gray-200 prose prose-sm max-w-none h-full">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiAnalysis.pseudocode}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis Required</h3>
                    <p className="text-gray-600">Run AI analysis to generate pseudocode</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'flowchart' && (
            <div className="h-[70vh] min-h-[500px] max-h-[900px] p-4">
              {aiAnalysis ? (
                <div className="h-full overflow-auto">
                  <div className="bg-white rounded border border-gray-200 p-4 h-full flex items-center justify-center">
                    <MermaidDiagram 
                      chart={aiAnalysis.flowchart} 
                      className="w-full max-w-4xl"
                      id={`flowchart-${functionInfo?.name}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔄</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis Required</h3>
                    <p className="text-gray-600">Run AI analysis to generate flowchart</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="h-[70vh] min-h-[500px] max-h-[900px] p-4">
              {aiAnalysis ? (
                <div className="h-full overflow-auto">
                  <div className="space-y-4">
                    {/* Complexity Analysis */}
                    <div className="bg-white p-4 rounded border border-gray-200 prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiAnalysis.complexityAnalysis}
                      </ReactMarkdown>
                    </div>

                    {/* Optimization Suggestions */}
                    {aiAnalysis.optimizationSuggestions.length > 0 && (
                      <div className="bg-white p-4 rounded border border-gray-200 prose prose-sm max-w-none">
                        {aiAnalysis.optimizationSuggestions.map((suggestion, index) => (
                          <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
                            {suggestion}
                          </ReactMarkdown>
                        ))}
                      </div>
                    )}

                    {/* Potential Issues */}
                    {aiAnalysis.potentialIssues.length > 0 && (
                      <div className="bg-white p-4 rounded border border-gray-200 prose prose-sm max-w-none">
                        {aiAnalysis.potentialIssues.map((issue, index) => (
                          <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
                            {issue}
                          </ReactMarkdown>
                        ))}
                      </div>
                    )}

                    {/* Analysis Timestamp */}
                    {aiAnalysis.analysisTimestamp && (
                      <div className="text-xs text-gray-500 text-center mt-4">
                        Analysis completed: {new Date(aiAnalysis.analysisTimestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis Required</h3>
                    <p className="text-gray-600">Run AI analysis to see detailed insights</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const FunctionAnalysis: React.FC<FunctionAnalysisProps> = ({ data }) => {
  const [selectedFunction, setSelectedFunction] = useState<{
    functionInfo: FunctionInfo;
    filePath: string;
    functionCode: string;
  } | null>(null);

  const closeDetailView = () => {
    setSelectedFunction(null);
  };

  // Close detail view on ESC key
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDetailView();
      }
    };

    if (selectedFunction) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [selectedFunction]);

  if (!data.functionAnalysis) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Function Analysis Available</h3>
        <p className="text-gray-600">Function analysis data is not available for this repository.</p>
      </div>
    );
  }

  const { functionAnalysis } = data;

  const extractFunctionCode = (filePath: string, startLine: number, endLine: number, functionName?: string): string => {
    if (!data.fileContents) return 'No file contents available';
    
    try {
      const lines = data.fileContents.split('\n');
      let inTargetFile = false;
      let fileLineNumber = 0; // Track actual line numbers within the current file
      const functionLines: string[] = [];
      
      // Extract filename from full path for matching
      const getFileName = (path: string) => {
        const normalizedPath = path.replace(/\\/g, '/');
        return normalizedPath.split('/').pop() || path;
      };
      
      const targetFileName = getFileName(filePath);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for file header pattern: FILE: filename
        if (line.match(/^FILE: .+$/)) {
          const headerFileName = line.replace(/^FILE: /, '').trim();
          // Match by filename or if header contains the target filename
          inTargetFile = headerFileName === targetFileName || 
                        headerFileName.endsWith('/' + targetFileName) ||
                        headerFileName.endsWith(targetFileName);
          fileLineNumber = 0; // Reset line counter for new file
          continue;
        }
        
        // Check for file separator lines - these mark end of file content
        if (line.match(/^=+$/)) {
          if (inTargetFile) {
            // We've reached the end of our target file
            break;
          }
          continue;
        }
        
        if (inTargetFile) {
          fileLineNumber++; // Increment for each line in the target file
          
          // Check if this line is within our function range (using 1-based line numbers)
          if (fileLineNumber >= startLine && fileLineNumber <= endLine) {
            functionLines.push(line);
          }
          
          // If we've passed the end line, we're done
          if (fileLineNumber > endLine) {
            break;
          }
        }
      }
      
      // If we found function lines, return them
      if (functionLines.length > 0) {
        // Clean up the function lines - remove excessive leading/trailing whitespace
        let cleanedLines = functionLines;
        
        // Remove leading empty lines
        while (cleanedLines.length > 0 && cleanedLines[0].trim() === '') {
          cleanedLines = cleanedLines.slice(1);
        }
        
        // Remove trailing empty lines
        while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
          cleanedLines = cleanedLines.slice(0, -1);
        }
        
        return cleanedLines.join('\n');
      }
      
      // Fallback: if precise line extraction failed, try to find the function by name
      if (functionName && functionName !== 'anonymous') {
        return findFunctionByName(lines, filePath, functionName);
      }
      
      return `Function code not found.

Details:
- File: ${targetFileName}
- Lines: ${startLine}-${endLine}
- Function: ${functionName || 'unknown'}

The function may be in a different file or the line numbers may be incorrect.
You can view all code in the Code tab.`;
      
    } catch (error) {
      return `Error extracting function code: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  // Helper function to find function by name as fallback
  const findFunctionByName = (lines: string[], filePath: string, functionName: string): string => {
    const targetFileName = filePath.split('/').pop() || filePath;
    let inTargetFile = false;
    const fileContent: string[] = [];
    
    // First, extract the content of the target file
    for (const line of lines) {
      if (line.match(/^FILE: .+$/)) {
        const headerFileName = line.replace(/^FILE: /, '').trim();
        inTargetFile = headerFileName === targetFileName || 
                      headerFileName.endsWith('/' + targetFileName) ||
                      headerFileName.endsWith(targetFileName);
        if (!inTargetFile && fileContent.length > 0) {
          break; // We found our file and moved past it
        }
        continue;
      }
      
      if (line.match(/^=+$/)) {
        if (inTargetFile) break; // End of our target file
        continue;
      }
      
      if (inTargetFile) {
        fileContent.push(line);
      }
    }
    
    if (fileContent.length === 0) {
      return `File content not found for ${targetFileName}`;
    }
    
    // Search for the function in the file content
    const functionPattern = new RegExp(`(def\\s+${functionName}|function\\s+${functionName}|${functionName}\\s*[=:]|class\\s+${functionName})`, 'i');
    
    for (let i = 0; i < fileContent.length; i++) {
      const line = fileContent[i];
      if (functionPattern.test(line)) {
        // Found the function, extract it with some context
        const extractedLines = [];
        let j = Math.max(0, i - 1); // Start one line before for context
        
        // Extract the function with reasonable bounds
        while (j < fileContent.length && j < i + 50) { // Limit to 50 lines max
          extractedLines.push(fileContent[j]);
          j++;
          
          // Stop at next function/class definition (simple heuristic)
          if (j > i + 2 && fileContent[j] && 
              /^(def |function |class |export |const .* = |let .* = )/.test(fileContent[j].trim())) {
            break;
          }
        }
        
        return extractedLines.join('\n');
      }
    }
    
    return `Function "${functionName}" not found in ${targetFileName}`;
  };

  const handleFunctionClick = (functionInfo: FunctionInfo, filePath: string) => {
    // Use the code provided by the backend if available, otherwise extract it
    const functionCode = functionInfo.code || 
                        extractFunctionCode(filePath, functionInfo.startLine, functionInfo.endLine, functionInfo.name);
    setSelectedFunction({ functionInfo, filePath, functionCode });
  };

  // Extract clean path (remove temp directory prefix)
  const getCleanPath = (path: string) => {
    const parts = path.split('/');
    // Find the actual project part (usually after a temp directory)
    const projectIndex = parts.findIndex(part => part.includes('-') && !part.startsWith('tmp') && !part.startsWith('var'));
    if (projectIndex > 0 && projectIndex < parts.length - 1) {
      return parts.slice(projectIndex).join('/');
    }
    // Fallback: show last 3-4 meaningful parts
    return parts.slice(-4).join('/');
  };

  // Get language icon
  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'python': return '🐍';
      case 'javascript': return '📜';
      case 'typescript': return '🔷';
      default: return '💻';
    }
  };

  // Get function type color
  const getFunctionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'function': return 'bg-blue-100 text-blue-800';
      case 'method': return 'bg-green-100 text-green-800';
      case 'class': return 'bg-purple-100 text-purple-800';
      case 'arrow': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter files that have functions
  const filesWithFunctions = functionAnalysis.files.filter(file => file.functions.length > 0);

  // Show detailed view if a function is selected
  if (selectedFunction) {
    return (
      <DetailedFunctionView
        isOpen={true}
        onClose={closeDetailView}
        functionInfo={selectedFunction.functionInfo}
        filePath={selectedFunction.filePath}
        functionCode={selectedFunction.functionCode}
      />
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-200 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Functions</p>
              <p className="text-2xl font-bold text-blue-900">{functionAnalysis.totalFunctions}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-200 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Files with Functions</p>
              <p className="text-2xl font-bold text-green-900">{filesWithFunctions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-200 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Avg per File</p>
              <p className="text-2xl font-bold text-purple-900">{functionAnalysis.avgFunctionsPerFile}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-200 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Top Language</p>
              <p className="text-lg font-bold text-orange-900 capitalize">
                {functionAnalysis.mostCommonLanguage || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Files with Functions</h3>
          <p className="text-sm text-gray-600 mt-1">Click on any function to view detailed analysis</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filesWithFunctions.map((file, fileIndex) => (
            <div key={fileIndex} className="p-6 hover:bg-gray-50 transition-colors">
              {/* File Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getLanguageIcon(file.language)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 font-mono text-sm">
                      {getCleanPath(file.path)}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {file.language} • {file.functionCount} function{file.functionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                {/* Function type breakdown */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(file.breakdown).map(([type, count]) => (
                    <span key={type} className={`px-2 py-1 text-xs rounded-md font-medium ${getFunctionTypeColor(type)}`}>
                      {type}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Functions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {file.functions.map((func, funcIndex) => (
                  <button
                    key={funcIndex}
                    onClick={() => handleFunctionClick(func, file.path)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900 truncate flex-1">
                        {func.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ml-2 flex-shrink-0 ${getFunctionTypeColor(func.type)}`}>
                        {func.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Lines {func.startLine}-{func.endLine} ({func.lineCount} lines)
                    </div>
                    <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to analyze →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )          )}
        </div>
      </div>


    </div>
  );
}; 