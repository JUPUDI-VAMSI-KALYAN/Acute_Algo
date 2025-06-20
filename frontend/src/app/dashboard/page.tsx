'use client';

// Import removed as AnalysisData is handled by layout
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepositoryDetail } from '@/components/Dashboard/RepositoryDetail';

export default function DashboardPage() {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
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
    } else {
      // No repository selected, redirect to home
      router.push('/');
      return;
    }
    
    setIsInitialized(true);
  }, [searchParams, router]);

  const handleAnalysisDataLoad = useCallback(() => {
    // This will be handled by the layout now
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-500">Loading...</span>
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
          <span className="ml-3 text-gray-500">Loading Repository...</span>
        </div>
      )}
    </div>
  );
}