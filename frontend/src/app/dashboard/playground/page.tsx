'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import PlaygroundChat, { PlaygroundChatRef } from "@/components/PlaygroundChat"
import { CodeEditor } from "@/components/CodeEditor"
import { AnalysisPanel } from "@/components/AnalysisPanel"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useChatContext } from "@/contexts/ChatContext"
import { getRepositoryAnalysis } from "@/lib/api"

export default function PlaygroundPage() {
  const [isAnalysisPanelCollapsed, setIsAnalysisPanelCollapsed] = useState(false);
  const { setSelectedAlgorithm, setCurrentRepository } = useChatContext();
  const chatRef = useRef<PlaygroundChatRef>(null);
  const searchParams = useSearchParams();

  // Load repository from URL parameters
  useEffect(() => {
    const repoFromUrl = searchParams.get('repo');
    
    if (repoFromUrl) {
      const loadRepositoryData = async () => {
        try {
          const data = await getRepositoryAnalysis(repoFromUrl);
          setCurrentRepository({
            id: parseInt(repoFromUrl),
            name: data.repository.name || 'Unknown Repository'
          });
        } catch (error) {
          console.error('Failed to load repository data:', error);
        }
      };
      
      loadRepositoryData();
    }
  }, [searchParams, setCurrentRepository]);

  // Auto-collapse the analysis panel after 2 seconds on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalysisPanelCollapsed(true);
    }, 2000);

    // Cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  const handleToggleAnalysisPanel = () => {
    setIsAnalysisPanelCollapsed(!isAnalysisPanelCollapsed);
  };

  const handleReset = () => {
    setSelectedAlgorithm(null);
    // Clear the chat input and messages
    chatRef.current?.clearChat();
    // Don't reset repository - keep it available for algorithm suggestions
  };
  return (
    <main className="h-full flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Algorithm Playground
        </h1>
        <Button 
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      
      {/* Three-panel layout */}
      <div className={`flex-1 grid gap-4 min-h-0 transition-all duration-300 ${
        isAnalysisPanelCollapsed 
          ? 'grid-cols-1 lg:grid-cols-[1fr_1fr_auto]' 
          : 'grid-cols-1 lg:grid-cols-3'
      }`}>
        {/* Chat Panel - Left */}
        <div className="flex flex-col rounded-lg border shadow-sm overflow-hidden">
          <PlaygroundChat ref={chatRef} />
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