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

interface AIAssistantPanelProps {
  functionInfo: FunctionInfo | null;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ functionInfo }) => {
  const [message, setMessage] = useState('');

  const suggestedQuestions = [
    "What does this function do?",
    "How can I optimize this code?",
    "Are there any potential bugs?",
    "Explain the algorithm used here"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-[60vh] min-h-[450px] max-h-[800px] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h4 className="font-semibold flex items-center">
            <span className="mr-2">🤖</span>
            AI Assistant
          </h4>
          <p className="text-blue-100 text-sm mt-1">
            Ask questions about {functionInfo?.name || 'this function'}
          </p>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          <div className="space-y-3">
            {/* Welcome Message */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Hi! I&apos;m here to help you understand this function. You can ask me about:
                  </p>
                  <ul className="mt-2 text-xs text-gray-600 space-y-1">
                    <li>• What the function does</li>
                    <li>• How to optimize it</li>
                    <li>• Potential issues or bugs</li>
                    <li>• Alternative implementations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Suggested Questions
              </p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about this function..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // TODO: Handle send message
                  console.log('Send message:', message);
                  setMessage('');
                }
              }}
            />
            <button 
              onClick={() => {
                // TODO: Handle send message
                console.log('Send message:', message);
                setMessage('');
              }}
              disabled={!message.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI chat functionality coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

const DetailedFunctionView: React.FC<DetailedFunctionViewProps> = ({
  isOpen,
  onClose,
  functionInfo,
  filePath,
  functionCode
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'pseudocode' | 'flowchart'>('code');
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

        {/* Main content tabs */}
        <div className="mt-6">
          <nav className="flex space-x-6 border-b border-gray-200">
            {[
              { id: 'code' as const, name: 'Code', icon: '💻' },
              { id: 'pseudocode' as const, name: 'Pseudocode', icon: '📝' },
              { id: 'flowchart' as const, name: 'Flowchart', icon: '🔄' }
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

      {/* Content Layout - Full width with responsive split */}
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Left Content Area - Takes 2/3 of screen on large screens */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'code' && (
            <div className="h-[60vh] min-h-[450px] max-h-[800px]">
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
            <div className="h-[60vh] min-h-[450px] max-h-[800px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pseudocode Coming Soon</h3>
                <p className="text-gray-600">AI-generated pseudocode will appear here</p>
              </div>
            </div>
          )}

          {activeTab === 'flowchart' && (
            <div className="h-[60vh] min-h-[450px] max-h-[800px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flowchart Coming Soon</h3>
                <p className="text-gray-600">Interactive flowchart visualization will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Right AI Assistant Panel - Takes 1/3 of screen on large screens, full width on mobile */}
        <div className="w-full lg:w-1/3">
          <AIAssistantPanel functionInfo={functionInfo} />
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
          ))}
        </div>
      </div>
    </div>
  );
}; 