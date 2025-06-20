import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Github } from 'lucide-react';
import { AnalysisData, analyzeRepository } from '@/lib/api';
import React from "react";

interface SiteHeaderProps {
  analysisData: AnalysisData | null;
  onReset: () => void;
  onRescan?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
  githubUrl?: string;
}

export function SiteHeader({ analysisData, onReset, onRescan, onError, githubUrl }: SiteHeaderProps) {
  const [isRescanning, setIsRescanning] = React.useState(false);

  const handleRescan = async () => {
    if (!githubUrl || !onRescan || !onError) {
      // Fallback or show an error if props are missing
      if (onError) {
        onError("Rescan cannot be performed. Configuration is missing.");
      }
      return;
    }

    setIsRescanning(true);
    try {
      const newData = await analyzeRepository(githubUrl);
      onRescan(newData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during rescan.";
      onError(errorMessage);
    } finally {
      setIsRescanning(false);
    }
  };
  
  return (
    <header className="flex h-20 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-foreground" />
      <Separator
        orientation="vertical"
        className="mx-2 h-6"
      />
      <div className="flex items-center justify-between w-full">
        {analysisData ? (
          <>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">{analysisData.repositoryName}</h1>
              {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Github size={24} />
              </a>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {onRescan && (
              <Button onClick={handleRescan} disabled={isRescanning}>
                  {isRescanning ? 'Rescanning...' : 'Rescan Repository'}
              </Button>
              )}
              <Button onClick={onReset} variant="outline">
              Analyze New Repository
              </Button>
            </div>
          </>
        ) : (
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        )}
      </div>
    </header>
  )
}
