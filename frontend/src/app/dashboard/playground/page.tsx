'use client';

import { useState } from 'react';
import { PlaygroundChat } from "@/components/PlaygroundChat"
import { CodeEditor } from "@/components/CodeEditor"
import { AnalysisPanel } from "@/components/AnalysisPanel"

export default function PlaygroundPage() {
  const [isAnalysisPanelCollapsed, setIsAnalysisPanelCollapsed] = useState(false);

  const handleToggleAnalysisPanel = () => {
    setIsAnalysisPanelCollapsed(!isAnalysisPanelCollapsed);
  };
  return (
    <main className="h-full flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
      <div className="flex items-center shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Algorithm Playground
        </h1>
      </div>
      
      {/* Three-panel layout */}
      <div className={`flex-1 grid gap-4 min-h-0 transition-all duration-300 ${
        isAnalysisPanelCollapsed 
          ? 'grid-cols-1 lg:grid-cols-[1fr_1fr_auto]' 
          : 'grid-cols-1 lg:grid-cols-3'
      }`}>
        {/* Chat Panel - Left */}
        <div className="flex flex-col rounded-lg border shadow-sm overflow-hidden">
          <div className="p-3 border-b bg-muted/50">
            <h2 className="font-medium text-sm">Acute AI</h2>
          </div>
          <div className="flex-1 min-h-0">
            <PlaygroundChat />
          </div>
        </div>
        
        {/* Code Editor Panel - Center */}
        <div className="flex flex-col rounded-lg border shadow-sm overflow-hidden">
          <div className="flex-1 min-h-0">
            <CodeEditor />
          </div>
        </div>
        
        {/* Analysis Panel - Right */}
        <div className={`flex flex-col rounded-lg border shadow-sm overflow-hidden transition-all duration-300 ${
          isAnalysisPanelCollapsed ? 'w-auto' : ''
        }`}>
          <div className="flex-1 min-h-0">
            <AnalysisPanel 
              isCollapsed={isAnalysisPanelCollapsed}
              onToggleCollapse={handleToggleAnalysisPanel}
            />
          </div>
        </div>
      </div>
    </main>
  );
}