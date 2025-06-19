'use client';

import React, { useState } from 'react';
import { AnalysisData } from '../../lib/api';
import { Sidebar } from './Sidebar';
import { RepositoryHeader } from './RepositoryHeader';
import { OverviewDashboard } from './OverviewDashboard';
import { FunctionAnalysis } from './FunctionAnalysis';
import { FileStructure } from './FileStructure';
import { CodeViewer } from './CodeViewer';
import ChatAssistant from '../ChatAssistant';
import { ChatProvider, useChatContext } from '../../contexts/ChatContext';

interface DashboardLayoutProps {
  data: AnalysisData;
  onReset: () => void;
  onRescan?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
  githubUrl?: string;
}

export type DashboardTab = 'overview' | 'functions' | 'structure' | 'code';

const DashboardContent: React.FC<DashboardLayoutProps> = ({
  data,
  onReset,
  onRescan,
  onError,
  githubUrl
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const { selectedFunction, setSelectedFunction } = useChatContext();

  // Clear selected function when switching to non-function tabs
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab !== 'functions') {
      setSelectedFunction(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard data={data} />;
      case 'functions':
        return <FunctionAnalysis data={data} />;
      case 'structure':
        return <FileStructure data={data} />;
      case 'code':
        return <CodeViewer analysisData={data} />;
      default:
        return <OverviewDashboard data={data} />;
    }
  };

  // Only show function info when on functions tab and a function is selected
  const shouldShowFunctionInfo = activeTab === 'functions' && selectedFunction;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
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

      {/* Chat Assistant - Context-aware based on current tab and selection */}
      <ChatAssistant 
        functionInfo={shouldShowFunctionInfo ? {
          name: selectedFunction.name,
          code: selectedFunction.code
        } : null}
        repositoryInfo={{
          name: data.repositoryName,
          totalFunctions: data.functionAnalysis?.totalFunctions || 0,
          languages: data.functionAnalysis?.languages ? Object.keys(data.functionAnalysis.languages) : [],
          structure: data.directoryTree.substring(0, 1000) // Limit structure size to avoid large payloads
        }}
      />
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  return (
    <ChatProvider>
      <DashboardContent {...props} />
    </ChatProvider>
  );
}; 