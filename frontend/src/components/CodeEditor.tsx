'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useChatContext } from '../contexts/ChatContext';
import { Code2, Loader2 } from 'lucide-react';


export function CodeEditor() {
  const { selectedAlgorithm } = useChatContext();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (selectedAlgorithm?.algorithm) {
      loadAlgorithmCode();
    } else {
      setCode(defaultCode);
    }
  }, [selectedAlgorithm]);

  const loadAlgorithmCode = async () => {
    if (!selectedAlgorithm?.algorithm) return;
    
    setIsLoading(true);
    try {
      // Extract the file path from the algorithm's file_analyses
      const fileAnalysis = selectedAlgorithm.algorithm.file_analyses?.[0];
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
          default:
            setLanguage('javascript');
        }
      }
    } catch (error) {
      console.error('Error loading algorithm code:', error);
      setCode(`// Error loading algorithm code
// ${error}`);
    } finally {
      setIsLoading(false);
    }
  };



  const handleFormatCode = () => {
    // TODO: Implement code formatting
    console.log('Formatting code...');
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              <CardTitle className="text-lg">
                {selectedAlgorithm?.algorithm ? 
                  `${selectedAlgorithm.algorithm.name} - Code` : 
                  'Code Editor'
                }
              </CardTitle>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
            <div className="flex gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleFormatCode} variant="outline" size="sm">
                Format Code
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          {!selectedAlgorithm?.algorithm && !isLoading ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-muted/30 rounded-lg p-6 border-2 border-dashed border-border">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-muted p-3 rounded-full">
                        <Code2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Ready to Code?
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Use <span className="bg-muted px-2 py-1 rounded font-mono text-xs">@</span> in chat to load algorithms, or start coding below.
                      </p>
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="// Start coding your algorithm here..."
                        className="h-full font-mono text-sm resize-none border-0 bg-background shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={selectedAlgorithm?.algorithm ? 
                  "Loading algorithm code..." : 
                  "Select an algorithm using @ in the chat or write your own code here..."
                }
                className="flex-1 font-mono text-sm resize-none h-full"
                disabled={isLoading}
              />
            )}
        </CardContent>
      </Card>
    </div>
  );
}