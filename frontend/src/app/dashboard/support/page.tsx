"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function SupportPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex h-full flex-col items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold md:text-4xl text-foreground mb-4">
              How can we help?
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              We&apos;re here to assist you with any questions, issues, or feedback you may have.
              Whether you&apos;re experiencing a technical problem, have a question about our features,
              or want to share your thoughts, our team is ready to help.
            </p>
            <div className="bg-card rounded-lg border p-6">
               <h2 className="text-xl font-semibold text-foreground mb-2">Contact Support</h2>
               <p className="text-muted-foreground">
                For direct assistance, please reach out to our support team. We aim to respond to all inquiries within 24 hours.
              </p>
              <p className="text-muted-foreground mt-4">
                You can email us at:{" "}
                <a
                  href="mailto:help@acutealgo.ai"
                  className="font-medium text-primary hover:underline"
                >
                  help@acutealgo.ai
                </a>
              </p>
            </div>
             <p className="text-sm text-muted-foreground mt-8">
              Your feedback is valuable to us and helps us improve Acute Algo for everyone.
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
