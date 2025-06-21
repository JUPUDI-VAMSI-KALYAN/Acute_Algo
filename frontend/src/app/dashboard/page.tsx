'use client';

// Import removed as AnalysisData is handled by layout
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepositoryDetail } from '@/components/Dashboard/RepositoryDetail';

export default function DashboardPage() {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [waitingForAutoSelect, setWaitingForAutoSelect] = useState(false);
  const initRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Prevent multiple initializations using ref
    if (initRef.current) return;
    initRef.current = true;
    
    const repoFromUrl = searchParams.get('repo');
    
    if (repoFromUrl) {
      setSelectedRepositoryId(repoFromUrl);
      setIsInitialized(true);
    } else {
      // No repository in URL, wait for auto-selection from RepositoryCombobox
      setWaitingForAutoSelect(true);
      // Set a timeout to redirect to home if no auto-selection happens
      const timeout = setTimeout(() => {
        if (!selectedRepositoryId) {
          router.push('/');
        }
      }, 5000); // Wait 5 seconds for auto-selection
      
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router, selectedRepositoryId]);

  // Handle URL changes when repository is auto-selected
  useEffect(() => {
    const repoFromUrl = searchParams.get('repo');
    if (repoFromUrl && waitingForAutoSelect) {
      setSelectedRepositoryId(repoFromUrl);
      setWaitingForAutoSelect(false);
      setIsInitialized(true);
    }
  }, [searchParams, waitingForAutoSelect]);

  const handleAnalysisDataLoad = useCallback(() => {
    // This will be handled by the layout now
  }, []);

  if (!isInitialized || waitingForAutoSelect) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-muted-foreground">
          {waitingForAutoSelect ? 'Loading repositories...' : 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      {selectedRepositoryId ? (
        <RepositoryDetail 
          repositoryId={selectedRepositoryId} 
          onDataLoaded={handleAnalysisDataLoad} 
        />
      ) : (
         <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Loading Repository...</span>
        </div>
      )}
    </div>
  );
}