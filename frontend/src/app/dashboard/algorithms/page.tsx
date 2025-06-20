"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AlgorithmsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl text-foreground">
              Algorithms
            </h1>
          </div>
          <div
            className="flex flex-1 items-center justify-center rounded-lg border shadow-sm"
            x-chunk="dashboard-02-chunk-1"
          >
            <p className="text-muted-foreground">
              Content for the Algorithms page will be added here soon.
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
