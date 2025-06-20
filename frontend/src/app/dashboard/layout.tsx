'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import { AnalysisData, analyzeAndSaveRepository, getRepositoryAnalysis } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | undefined>(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const repoFromUrl = searchParams.get('repo');
    
    if (repoFromUrl) {
      // Load repository analysis data for the site header
      loadRepositoryAnalysis(repoFromUrl);
    }
  }, [searchParams]);

  const loadRepositoryAnalysis = async (repositoryId: string) => {
    try {
      const data = await getRepositoryAnalysis(repositoryId);
      
      // Check if data and repository exist
      if (!data || !data.repository) {
        console.error('Repository data not found in response');
        return;
      }
      
      // Transform Repository data to AnalysisData format for the header
      const analysisData: AnalysisData = {
        repositoryName: data.repository.name || 'Unknown Repository',
        fileCounts: { javascript: 0, python: 0, typescript: 0, total: 0 },
        directoryTree: data.repository.directoryTree || '',
        fileContents: data.repository.fileContents || '',
        totalCharacters: data.repository.totalCharacters || 0,
        functionAnalysis: {
          totalFunctions: data.analysisSession?.totalFunctions || 0,
          totalAlgorithms: data.analysisSession?.totalAlgorithms || 0,
          totalAnalyzedFiles: data.analysisSession?.totalAnalyzedFiles || 0,
          avgFunctionsPerFile: data.analysisSession?.avgFunctionsPerFile || 0,
          avgAlgorithmsPerFile: data.analysisSession?.avgAlgorithmsPerFile || 0,
          mostCommonLanguage: data.analysisSession?.mostCommonLanguage || null,
          languages: {},
          files: [],
          largestFiles: [],
        }
      };
      
      setAnalysisData(analysisData);
      setGithubUrl(data.repository.githubUrl);
    } catch (error) {
      console.error('Failed to load repository analysis:', error);
      // Don't show error toast here as it's background loading for header
    }
  };

  const handleReset = () => {
    router.push('/');
  };
  
  const handleRescan = async () => {
    if (!githubUrl) {
      toast.error("No GitHub URL found for rescanning");
      return;
    }
    
    try {
      toast.info("Starting repository rescan...");
      const response = await analyzeAndSaveRepository(githubUrl);
      setAnalysisData(response.data);
      toast.success("Rescan completed successfully!");
      
      // Refresh the current page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rescan repository');
    }
  };

  const handleError = (errorMessage: string) => {
    toast.error(errorMessage);
  };



  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-screen flex-col">
        <SiteHeader
          analysisData={analysisData}
          onReset={handleReset}
          onRescan={handleRescan}
          onError={handleError}
          githubUrl={githubUrl}
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
} 