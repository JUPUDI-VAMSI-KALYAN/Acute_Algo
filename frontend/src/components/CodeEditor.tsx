'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useChatContext } from '../contexts/ChatContext';
import { Code2, Loader2 } from 'lucide-react';

// Default welcome message
const defaultCode = `// 🚀 Welcome to the Algorithm Playground Code Editor!
//
// 📋 How to get started:
// 1. Type @ in the chat to browse and select algorithms from your repository
// 2. View algorithm code, analysis, and pseudocode here
// 3. Edit and experiment with the code in real-time
// 4. Ask the AI assistant questions about algorithms and code
//
// 💡 You can also write and test your own algorithms here!

// Example: Simple algorithm to get you started
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found target at index mid
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Target not found
}

// Test the algorithm
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
const targetValue = 7;
const result = binarySearch(sortedArray, targetValue);
console.log(\`Target \${targetValue} found at index: \${result}\`);

// 🎯 Try selecting an algorithm with @ in the chat to see real code!`;

export function CodeEditor() {
  const { selectedAlgorithm } = useChatContext();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);

  const loadAlgorithmCode = useCallback(async () => {
    if (!selectedAlgorithm?.algorithm) return;
    
    setIsLoading(true);
    try {
      // Extract the file path from the algorithm's file_analyses
      const fileAnalysis = selectedAlgorithm.algorithm.file_analyses;
      if (fileAnalysis?.file_path) {
        // In a real implementation, you would fetch the file content from the backend
        // For now, we'll show the algorithm information
        const algorithmInfo = `// Algorithm: ${selectedAlgorithm.algorithm.name}
// Type: ${selectedAlgorithm.algorithm.type}
// Lines: ${selectedAlgorithm.algorithm.start_line}-${selectedAlgorithm.algorithm.end_line}
// File: ${fileAnalysis.file_path}
// Algorithm Score: ${selectedAlgorithm.algorithm.algorithm_score}

// To view the actual code, the backend would need to provide
// an endpoint to fetch file content by path and line range

// Classification: ${selectedAlgorithm.algorithm.classification_reason}

${selectedAlgorithm.aiAnalysis?.pseudocode ? `/*
Pseudocode:
${selectedAlgorithm.aiAnalysis.pseudocode}
*/` : ''}`;
        
        setCode(algorithmInfo);
        
        // Detect language from file extension
        const extension = fileAnalysis.file_path.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'py':
            setLanguage('python');
            break;
          case 'js':
          case 'jsx':
            setLanguage('javascript');
            break;
          case 'ts':
          case 'tsx':
            setLanguage('typescript');
            break;
          case 'java':
            setLanguage('java');
            break;
          case 'cpp':
          case 'cc':
          case 'cxx':
            setLanguage('cpp');
            break;
          case 'c':
            setLanguage('c');
            break;
          case 'go':
            setLanguage('go');
            break;
          case 'rs':
            setLanguage('rust');
            break;
          case 'rb':
            setLanguage('ruby');
            break;
          case 'php':
            setLanguage('php');
            break;
          case 'cs':
            setLanguage('csharp');
            break;
          case 'swift':
            setLanguage('swift');
            break;
          case 'kt':
            setLanguage('kotlin');
            break;
          case 'scala':
            setLanguage('scala');
            break;
          default:
            setLanguage('text');
        }
      }
    } catch (error) {
      console.error('Error loading algorithm code:', error);
      setCode('// Error loading algorithm code');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAlgorithm]);

  useEffect(() => {
    if (selectedAlgorithm?.algorithm) {
      loadAlgorithmCode();
    } else {
      setCode(defaultCode);
    }
  }, [selectedAlgorithm, loadAlgorithmCode]);

  const handleRunCode = () => {
    // This would integrate with a code execution service
    console.log('Running code:', code);
    alert('Code execution would be implemented here!');
  };

  const handleFormatCode = () => {
    // Basic formatting - in a real app, you'd use a proper formatter
    try {
      if (language === 'javascript' || language === 'typescript') {
        // Very basic JS formatting
        const formatted = code
          .split('\n')
          .map(line => line.trim())
          .join('\n');
        setCode(formatted);
      }
    } catch (error) {
      console.error('Error formatting code:', error);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Code Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
                <SelectItem value="swift">Swift</SelectItem>
                <SelectItem value="kotlin">Kotlin</SelectItem>
                <SelectItem value="scala">Scala</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="h-full min-h-[400px] resize-none font-mono text-sm border-0 rounded-none focus:ring-0"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
          />
        </div>
        <div className="border-t p-3 bg-muted/30">
          <div className="flex gap-2">
            <Button
              onClick={handleRunCode}
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a2 2 0 00-2-2H5a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V4z" />
              </svg>
              Run Code
            </Button>
            <Button
              onClick={handleFormatCode}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Format
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}