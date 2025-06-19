import React from 'react';
import { DashboardTab } from './DashboardLayout';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
    description: 'Repository summary and stats'
  },
  {
    id: 'functions',
    label: 'Functions',
    icon: '⚡',
    description: 'Function analysis and breakdown'
  },
  {
    id: 'structure',
    label: 'Structure',
    icon: '🗂️',
    description: 'Directory tree and organization'
  },
  {
    id: 'code',
    label: 'Code Files',
    icon: '💻',
    description: 'Browse all code content'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold text-black" 
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Acute Algo
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-blue-200 border'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Built by ThinkArc, Inc.</p>
        </div>
      </div>
    </div>
  );
}; 