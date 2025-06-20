"use client"

import * as React from 'react';
import {
  LayoutDashboard,
  Code,
  PlayCircle,
  Settings,
  MessageSquare,
  LifeBuoy,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

const data = {
  user: {
    name: 'Vamsi',
    email: 'vamsi@acme.com',
    avatar: '/avatars/shadcn.jpg', // Replace with actual path or dynamic value
  },
  navMain: [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: LayoutDashboard,
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
        <NavMain items={data.navMain} />
        <div className="mt-auto">
          <NavMain items={data.navSecondary} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
