'use client';

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Github } from 'lucide-react';
import { AnalysisData, analyzeAndSaveRepository } from '@/lib/api';
import React, { useState, useEffect } from "react";
import { ThemeToggle } from '@/components/ThemeToggle';

interface SiteHeaderProps {
  analysisData: AnalysisData | null;
  onReset: () => void;
  onRescan?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
  githubUrl?: string;
}

export function SiteHeader({ 
  analysisData, 
  onReset, 
  onRescan, 
  onError, 
  githubUrl,
}: SiteHeaderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleRescan = async () => {
    if (!githubUrl || !onRescan) return;
    
    try {
      const response = await analyzeAndSaveRepository(githubUrl);
      onRescan(response.data);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to rescan repository');
      }
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
        <SidebarTrigger className="-ml-1 text-foreground font-bold drop-shadow flex-shrink-0" />
        <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4 flex-shrink-0" />
        {isHydrated && analysisData && (
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 max-w-full overflow-hidden">
              <span className="text-sm sm:text-lg font-bold text-foreground drop-shadow truncate">
                {analysisData.repositoryName}
              </span>
              {githubUrl && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  title="View on GitHub"
                >
                  <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      {isHydrated && (
        <div className="flex items-center gap-1 sm:gap-2 justify-end flex-shrink-0">
          <ThemeToggle />
          {analysisData && (
            <>
              {onRescan && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRescan}
                  className="hidden sm:inline-flex mr-1 sm:mr-2 text-xs sm:text-sm"
                >
                  <span className="hidden md:inline">Rescan</span>
                  <span className="md:hidden">↻</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReset}
                className="text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Analyze New Repository</span>
                <span className="sm:hidden">New</span>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
