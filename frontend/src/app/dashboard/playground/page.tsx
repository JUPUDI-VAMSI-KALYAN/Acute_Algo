"use client"

import { PlaygroundChat } from "@/components/PlaygroundChat"

export default function PlaygroundPage() {
  return (
    <main className="h-full flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
      <div className="flex items-center shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Algorithm Playground
        </h1>
      </div>
      <div className="flex-1 rounded-lg border shadow-sm overflow-hidden min-h-0">
        <PlaygroundChat />
      </div>
    </main>
  );
} 