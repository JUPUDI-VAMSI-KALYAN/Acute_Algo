'use client';

import { DashboardLayout } from '@/components/Dashboard';
import { AnalysisData } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Try to get full analysis data from sessionStorage first
    const fullData = sessionStorage.getItem('fullAnalysisData');
    const essentialData = localStorage.getItem('analysisData');

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

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <DashboardLayout data={analysisData} onReset={handleReset} />;
} 