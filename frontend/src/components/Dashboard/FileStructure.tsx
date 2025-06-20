'use client';

import React, { useState, useMemo } from 'react';
import { AnalysisData } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FileStructureProps {
  data: AnalysisData;
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  path: string;
  extension?: string;
}

interface FileTreeItemProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level, isExpanded, onToggle }) => {
  const getFileIcon = (extension?: string) => {
    if (!extension) return '📄';
    switch (extension.toLowerCase()) {
      case '.js': return '📜';
      case '.ts': return '🔷';
      case '.tsx': return '🔶';
      case '.jsx': return '⚛️';
      case '.py': return '🐍';
      case '.json': return '📋';
      case '.md': return '📝';
      case '.css': return '🎨';
      case '.html': return '🌐';
      case '.yml':
      case '.yaml': return '⚙️';
      case '.txt': return '📄';
      default: return '📄';
    }
  };

  const paddingLeft = level * 20;

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 hover:bg-muted cursor-pointer transition-colors rounded`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={node.type === 'folder' ? onToggle : undefined}
      >
        {node.type === 'folder' && (
          <span className="mr-2 text-muted-foreground text-sm">
            {isExpanded ? '📂' : '📁'}
          </span>
        )}
        {node.type === 'file' && (
          <span className="mr-2 text-sm">
            {getFileIcon(node.extension)}
          </span>
        )}
        <span className={`text-sm ${
          node.type === 'folder' 
            ? 'font-medium' 
            : 'text-muted-foreground'
        }`}>
          {node.name}
        </span>
        {node.type === 'file' && node.extension && (
          <Badge variant="outline" className="ml-auto text-xs">
            {node.extension}
          </Badge>
        )}
      </div>
    </div>
  );
};

export const FileStructure: React.FC<FileStructureProps> = ({ data }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const parseDirectoryTree = (treeString: string): TreeNode[] => {
    const lines = treeString.split('\n').filter(line => line.trim());
    const root: TreeNode[] = [];
    const stack: { node: TreeNode; level: number }[] = [];

    for (const line of lines) {
      const level = (line.match(/[│├└]/g) || []).length;
      const name = line.replace(/^[│├└─\s]+/, '').trim();
      
      if (!name) continue;

      const isFile = name.includes('.');
      const extension = isFile ? name.substring(name.lastIndexOf('.')) : undefined;
      
      const node: TreeNode = {
        name,
        type: isFile ? 'file' : 'folder',
        children: isFile ? undefined : [],
        path: line,
        extension
      };

      // Remove items from stack that are at the same level or deeper
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(node);
      } else {
        const parent = stack[stack.length - 1].node;
        if (parent.children) {
          parent.children.push(node);
        }
      }

      if (!isFile) {
        stack.push({ node, level });
      }
    }

    return root;
  };

  const treeData = useMemo(() => {
    if (!data.directoryTree) return [];
    return parseDirectoryTree(data.directoryTree);
  }, [data.directoryTree]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const expandAll = () => {
    const allFolders = new Set<string>();
    const collectFolders = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'folder') {
          allFolders.add(node.path);
          if (node.children) {
            collectFolders(node.children);
          }
        }
      });
    };
    collectFolders(treeData);
    setExpandedFolders(allFolders);
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    
    return (
      <div key={node.path}>
        <FileTreeItem 
          node={node}
          level={level}
          isExpanded={isExpanded}
          onToggle={() => toggleFolder(node.path)}
        />
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getFileCount = (nodes: TreeNode[]): { files: number; folders: number } => {
    let files = 0;
    let folders = 0;
    
    const count = (nodeList: TreeNode[]) => {
      nodeList.forEach(node => {
        if (node.type === 'file') {
          files++;
        } else {
          folders++;
          if (node.children) {
            count(node.children);
          }
        }
      });
    };
    
    count(nodes);
    return { files, folders };
  };

  const counts = getFileCount(treeData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Directory Structure</CardTitle>
              <CardDescription>
                Interactive file tree for {data.repositoryName}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{counts.files}</span> files • <span className="font-medium">{counts.folders}</span> folders
              </div>
              <Button
                onClick={expandAll}
                variant="outline"
                size="sm"
              >
                Expand All
              </Button>
              <Button
                onClick={collapseAll}
                variant="outline"
                size="sm"
              >
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interactive File Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-lg">🗂️</span>
            <span>Project Files</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="max-h-96 overflow-y-auto bg-muted/50 rounded-lg p-4">
            {treeData.length > 0 ? (
              <div className="space-y-1">
                {treeData.map(node => renderTreeNode(node))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <span className="text-2xl mb-2 block">📁</span>
                <p>No directory structure available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Type Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center p-4">
                <div className="text-2xl mb-2">📜</div>
                <p className="text-lg font-bold">{data.fileCounts.javascript}</p>
                <p className="text-sm text-muted-foreground">JavaScript</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <div className="text-2xl mb-2">🔷</div>
                <p className="text-lg font-bold">{data.fileCounts.typescript}</p>
                <p className="text-sm text-muted-foreground">TypeScript</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <div className="text-2xl mb-2">🐍</div>
                <p className="text-lg font-bold">{data.fileCounts.python}</p>
                <p className="text-sm text-muted-foreground">Python</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-lg font-bold">{data.fileCounts.total}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 