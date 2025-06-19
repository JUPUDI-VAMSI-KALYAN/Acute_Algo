import React, { useState } from 'react';
import { AnalysisData } from '../../lib/api';
import { Sidebar } from './Sidebar';
import { RepositoryHeader } from './RepositoryHeader';
import { OverviewDashboard } from './OverviewDashboard';
import { FunctionAnalysis } from './FunctionAnalysis';
import { FileStructure } from './FileStructure';
import { CodeViewer } from './CodeViewer';

interface DashboardLayoutProps {
  data: AnalysisData;
  onReset: () => void;
  onRescan?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
  githubUrl?: string;
}

export type DashboardTab = 'overview' | 'functions' | 'structure' | 'code';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  data,
  onReset,
  onRescan,
  onError,
  githubUrl
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard data={data} />;
      case 'functions':
        return <FunctionAnalysis data={data} />;
      case 'structure':
        return <FileStructure data={data} />;
      case 'code':
        return <CodeViewer data={data} />;
      default:
        return <OverviewDashboard data={data} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <RepositoryHeader
          data={data}
          onReset={onReset}
          onRescan={onRescan}
          onError={onError}
          githubUrl={githubUrl}
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}; 