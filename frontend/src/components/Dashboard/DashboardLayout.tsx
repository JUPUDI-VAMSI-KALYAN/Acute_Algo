'use client';

import React, { useState } from 'react';
import { AnalysisData } from '../../lib/api';
import { RepositoryHeader } from './RepositoryHeader';
import { OverviewDashboard } from './OverviewDashboard';
import { FunctionAnalysis } from './FunctionAnalysis';
import { FileStructure } from './FileStructure';
import { CodeViewer } from './CodeViewer';
import ChatAssistant from '../ChatAssistant';
import { ChatProvider, useChatContext } from '../../contexts/ChatContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardLayoutProps {
  data: AnalysisData;
  onReset: () => void;
  onRescan?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
  githubUrl?: string;
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({
  data,
  onReset,
  onRescan,
  onError,
  githubUrl
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { selectedFunction, setSelectedFunction } = useChatContext();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'functions') {
      setSelectedFunction(null);
    }
  };

  const shouldShowFunctionInfo = activeTab === 'functions' && selectedFunction;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <RepositoryHeader
          data={data}
          onReset={onReset}
          onRescan={onRescan}
          onError={onError}
          githubUrl={githubUrl}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
              <TabsTrigger value="structure">File Structure</TabsTrigger>
              <TabsTrigger value="code">Code Viewer</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewDashboard data={data} />
            </TabsContent>
            <TabsContent value="functions">
              <FunctionAnalysis data={data} />
            </TabsContent>
            <TabsContent value="structure">
              <FileStructure data={data} />
            </TabsContent>
            <TabsContent value="code">
              <CodeViewer analysisData={data} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ChatAssistant 
        functionInfo={shouldShowFunctionInfo ? {
          name: selectedFunction.name,
          code: selectedFunction.code
        } : null}
        repositoryInfo={{
          name: data.repositoryName,
          totalFunctions: data.functionAnalysis?.totalFunctions || 0,
          languages: data.functionAnalysis?.languages ? Object.keys(data.functionAnalysis.languages) : [],
          structure: data.directoryTree.substring(0, 1000)
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