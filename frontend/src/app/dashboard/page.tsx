'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AnalysisData } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/Dashboard';
import { SiteHeader } from '@/components/site-header';
import { toast } from "sonner"

export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    // Try to get full analysis data from sessionStorage first
    const fullData = sessionStorage.getItem('fullAnalysisData');
    const essentialData = localStorage.getItem('analysisData');
    const url = localStorage.getItem('githubUrl');
    
    setGithubUrl(url ?? undefined);

    if (!fullData && !essentialData) {
      // If no data is found, redirect back to home
      router.push('/');
      return;
    }

    try {
      // Prefer full data if available
      const data = fullData ? JSON.parse(fullData) : JSON.parse(essentialData!);
      setAnalysisData(data);
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      router.push('/');
    }
  }, [router]);

  const handleReset = () => {
    localStorage.removeItem('analysisData');
    sessionStorage.removeItem('fullAnalysisData');
    localStorage.removeItem('githubUrl');
    router.push('/');
  };

  const handleRescan = (newData: AnalysisData) => {
    sessionStorage.setItem('fullAnalysisData', JSON.stringify(newData));
    setAnalysisData(newData);
    toast.success("Rescan complete!");
  };

  const handleError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader
          analysisData={analysisData}
          onReset={handleReset}
          onRescan={handleRescan}
          onError={handleError}
          githubUrl={githubUrl}
        />
        <div className="flex flex-1 flex-col">
          <DashboardLayout data={analysisData} onReset={handleReset} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 