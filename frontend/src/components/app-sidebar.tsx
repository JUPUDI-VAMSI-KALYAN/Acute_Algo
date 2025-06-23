"use client"

import * as React from 'react';
import {
  LayoutDashboard,
  Code,
  PlayCircle,
  Settings,
  MessageSquare,
  LifeBuoy,
  GitBranch,
  Lightbulb,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { RepositoryCombobox } from '@/components/RepositoryCombobox';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

// Move static data outside component to prevent re-renders
const SIDEBAR_DATA = {
  navMain: [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Functions',
      url: '/dashboard/functions',
      icon: GitBranch,
    },
    {
      title: 'Algorithms',
      url: '/dashboard/algorithms',
      icon: Code,
    },
    {
      title: 'Playground',
      url: '/dashboard/playground',
      icon: PlayCircle,
    },
  ],
  navSecondary: [
    {
      title: 'Feature Requests',
      url: '/features',
      icon: Lightbulb,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings,
    },
    {
      title: 'Support',
      url: '/dashboard/support',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '/dashboard/feedback',
      icon: MessageSquare,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-12 w-12">
            <Code className="h-7 w-7" />
          </Button>
          {state === 'expanded' && (
            <h1 className="text-2xl font-serif font-bold">Acute Algo</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        {/* Repository Selection */}
        {state === 'expanded' && (
          <div className="px-2 py-2">
            <RepositoryCombobox 
              placeholder="Select repository..."
            />
          </div>
        )}
        
        {/* Add separator when repository selector is shown */}
        {state === 'expanded' && <Separator className="mx-2" />}
        
        <NavMain items={SIDEBAR_DATA.navMain} />
        <div className="mt-auto">
          <NavMain items={SIDEBAR_DATA.navSecondary} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
