import React, { useState } from 'react';
import { AnalysisData, FunctionInfo, copyToClipboard } from '../../lib/api';

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
  const [activeTab, setActiveTab] = useState<'code' | 'pseudocode' | 'flowchart' | 'chat'>('code');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

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
    <div className="space-y-6">
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
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <nav className="flex space-x-8">
            {[
              { id: 'code' as const, name: 'Code', icon: '💻' },
              { id: 'pseudocode' as const, name: 'Pseudocode', icon: '📝' },
              { id: 'flowchart' as const, name: 'Flowchart', icon: '🔄' },
              { id: 'chat' as const, name: 'AI Assistant', icon: '🤖' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-96">
            <div className="h-full bg-gray-900 rounded-xl overflow-hidden">
              <div className="h-full overflow-auto">
                <pre className="text-green-400 text-sm font-mono p-6 whitespace-pre-wrap min-h-full">
                  <code>{functionCode}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pseudocode' && (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pseudocode Coming Soon</h3>
              <p className="text-gray-600">AI-generated pseudocode will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'flowchart' && (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flowchart Coming Soon</h3>
              <p className="text-gray-600">Interactive flowchart visualization will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant Coming Soon</h3>
              <p className="text-gray-600">Chat with AI about this function will appear here</p>
            </div>
          </div>
        )}
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
      let currentLine = 1;
      const functionLines: string[] = [];
      
      // Extract filename from full path for matching - try multiple approaches
      const getFileName = (path: string) => {
        const normalizedPath = path.replace(/\\/g, '/');
        return normalizedPath.split('/').pop() || path;
      };
      
      const targetFileName = getFileName(filePath);
      const fullPath = filePath; // Also try matching with full path
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for file header pattern: FILE: filename
        if (line.match(/^FILE: .+$/)) {
          const headerFileName = line.replace(/^FILE: /, '').trim();
          // Try matching both filename and full path
          inTargetFile = headerFileName === targetFileName || headerFileName === fullPath || 
                        headerFileName.endsWith(targetFileName) || targetFileName.endsWith(headerFileName);
          currentLine = 1;
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
          // We're in the target file, check if this line is within our function range
          if (currentLine >= startLine && currentLine <= endLine) {
            functionLines.push(line);
          }
          
          // If we've collected all the function lines, break
          if (currentLine > endLine) {
            break;
          }
          
          currentLine++;
        }
      }
      
      // If we found function lines, return them
      if (functionLines.length > 0) {
        return functionLines.join('\n');
      }
      
      // Fallback: try to extract by searching for the function name within the target file
      if (functionName) {
        // Reset and search for the function by name within the correct file
        inTargetFile = false;
        let fileContent = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.match(/^FILE: .+$/)) {
            const headerFileName = line.replace(/^FILE: /, '').trim();
            // Try matching both filename and full path
            inTargetFile = headerFileName === targetFileName || headerFileName === fullPath || 
                          headerFileName.endsWith(targetFileName) || targetFileName.endsWith(headerFileName);
            fileContent = [];
            continue;
          }
          
          if (line.match(/^=+$/)) {
            if (inTargetFile && fileContent.length > 0) {
              // We've reached the end of our target file, search for function
              break;
            }
            continue;
          }
          
          if (inTargetFile) {
            fileContent.push(line);
          }
        }
        
        // Now search for the function within the file content
        if (fileContent.length > 0) {
          let foundFunction = false;
          let indentLevel = 0;
          let baseIndent = 0;
          const functionCode = [];
          
          for (let i = 0; i < fileContent.length; i++) {
            const line = fileContent[i];
            
            // Look for function declaration
            if (!foundFunction && line.includes(functionName) && 
                (line.includes('function') || line.includes('=>') || line.includes('def ') || 
                 line.includes('class ') || line.includes('const ') || line.includes('let ') || 
                 line.includes('var ') || line.includes('export '))) {
              foundFunction = true;
              functionCode.push(line);
              
              // For Python functions, track indentation level
              if (line.includes('def ')) {
                const match = line.match(/^(\s*)/);
                baseIndent = match ? match[1].length : 0;
              }
              
              // For JS/TS functions with braces
              if (line.includes('{')) {
                indentLevel = 1;
              }
              
              // Check for single line arrow functions
              if (line.includes('=>') && !line.includes('{') && line.trim().endsWith(';')) {
                break;
              }
            } else if (foundFunction) {
              // For Python: check if we've reached a line with same or less indentation (end of function)
              if (line.includes('def ') && line.trim().length > 0) {
                const match = line.match(/^(\s*)/);
                const currentIndent = match ? match[1].length : 0;
                if (currentIndent <= baseIndent) {
                  break; // End of function
                }
              }
              
              // For JS/TS: count braces
              if (line.includes('{')) indentLevel++;
              if (line.includes('}')) indentLevel--;
              
              functionCode.push(line);
              
              // End condition for brace-based languages
              if (indentLevel === 0 && (line.includes('}') || line.includes(';'))) {
                break;
              }
              
              // End condition for Python: empty line followed by dedented code or end of file
              if (line.includes('def ') && line.trim().length === 0 && i < fileContent.length - 1) {
                const nextLine = fileContent[i + 1];
                if (nextLine && nextLine.trim().length > 0) {
                  const match = nextLine.match(/^(\s*)/);
                  const nextIndent = match ? match[1].length : 0;
                  if (nextIndent <= baseIndent) {
                    break; // End of function
                  }
                }
              }
            }
            
            // Limit function extraction to reasonable size
            if (functionCode.length > 200) {
              functionCode.push('// ... function continues ...');
              break;
            }
          }
          
          if (functionCode.length > 0) {
            return functionCode.join('\n');
          }
        }
      }
      
      // Let's also try a simple debug output to see the file structure
      const firstLines = lines.slice(0, 10).join('\n');
      const fileHeaders = lines.filter(line => line.match(/^FILE: .+$/)).slice(0, 5);
      
      return `Function code not found. 

Debugging info:
- Target file: ${filePath}
- Target filename: ${targetFileName}
- Line range: ${startLine}-${endLine}
- Content length: ${data.fileContents.length} characters
- Function name: ${functionName}

File structure (first 10 lines):
${firstLines}

Found file headers:
${fileHeaders.join('\n') || 'No file headers found'}

You can view all code in the Code tab.`;
      
    } catch (error) {
      return `Error extracting function code: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const handleFunctionClick = (functionInfo: FunctionInfo, filePath: string) => {
    const functionCode = extractFunctionCode(filePath, functionInfo.startLine, functionInfo.endLine, functionInfo.name);
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
    <div className="space-y-6">
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
          ))}
        </div>
      </div>
    </div>
  );
}; 