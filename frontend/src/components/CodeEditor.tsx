'use client';

import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';


export function CodeEditor() {
  const [code, setCode] = useState(`// Welcome to the Code Editor
// You can write and edit your code here

function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Example usage
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log(bubbleSort(numbers));`);
  const [language, setLanguage] = useState('javascript');



  const handleFormatCode = () => {
    // TODO: Implement code formatting
    console.log('Formatting code...');
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Code Editor</CardTitle>
            <div className="flex gap-2">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="typescript">TypeScript</option>
              </select>
              <Button onClick={handleFormatCode} variant="outline" size="sm">
                Format Code
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="flex-1 font-mono text-sm resize-none h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}