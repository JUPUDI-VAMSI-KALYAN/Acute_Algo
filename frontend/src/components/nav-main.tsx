"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { memo } from "react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

interface NavMainProps {
  items: NavItem[]
  title?: string
}

export const NavMain = memo(function NavMain({
  items,
  title,
}: NavMainProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get current repository ID to preserve it in navigation
  const currentRepo = searchParams.get('repo')
  
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;
          const IconComponent = item.icon;
          
          // Preserve repository parameter in navigation URLs
          const href = currentRepo ? `${item.url}?repo=${currentRepo}` : item.url;
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
              >
                <Link href={href}>
                  {IconComponent && <IconComponent />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})
