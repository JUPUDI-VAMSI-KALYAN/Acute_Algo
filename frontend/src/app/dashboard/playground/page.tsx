"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { PlaygroundChat } from "@/components/PlaygroundChat"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PlaygroundPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl text-foreground">
              Algorithm Playground
            </h1>
          </div>
          <div
            className="flex-1 rounded-lg border shadow-sm overflow-hidden"
            x-chunk="dashboard-02-chunk-1"
          >
            <PlaygroundChat />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 