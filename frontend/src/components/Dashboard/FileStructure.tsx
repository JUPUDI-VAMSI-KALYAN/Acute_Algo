'use client';

import React, { useState, useMemo } from 'react';
import { AnalysisData } from '../../lib/api';

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
        className={`flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer transition-colors rounded`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={node.type === 'folder' ? onToggle : undefined}
      >
        {node.type === 'folder' && (
          <span className="mr-2 text-gray-400 text-sm">
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
            ? 'font-medium text-gray-800' 
            : 'text-gray-700'
        }`}>
          {node.name}
        </span>
        {node.type === 'file' && node.extension && (
          <span className="ml-auto text-xs text-gray-400">
            {node.extension}
          </span>
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Directory Structure</h2>
            <p className="text-gray-600">
              Interactive file tree for <span className="font-medium">{data.repositoryName}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{counts.files}</span> files • <span className="font-medium">{counts.folders}</span> folders
            </div>
            <button
              onClick={expandAll}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-sm font-medium transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Interactive File Tree */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🗂️</span>
            <h3 className="font-semibold text-gray-900">Project Files</h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {treeData.length > 0 ? (
              <div className="space-y-1">
                {treeData.map(node => renderTreeNode(node))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <span className="text-2xl mb-2 block">📁</span>
                <p>No directory structure available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Type Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-1">📜</div>
            <p className="text-lg font-bold text-yellow-900">{data.fileCounts.javascript}</p>
            <p className="text-sm text-yellow-700">JavaScript</p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">🔷</div>
            <p className="text-lg font-bold text-blue-900">{data.fileCounts.typescript}</p>
            <p className="text-sm text-blue-700">TypeScript</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">🐍</div>
            <p className="text-lg font-bold text-green-900">{data.fileCounts.python}</p>
            <p className="text-sm text-green-700">Python</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-1">📄</div>
            <p className="text-lg font-bold text-gray-900">{data.fileCounts.total}</p>
            <p className="text-sm text-gray-700">Total Files</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 