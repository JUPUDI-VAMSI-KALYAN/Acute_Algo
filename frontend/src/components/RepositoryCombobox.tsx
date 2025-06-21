"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GitBranch } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getRepositoriesSummary } from "@/lib/api"

interface Repository {
  id: string
  name: string
  githubUrl: string
  createdAt: string
  totalCharacters?: number
}

interface RepositoryComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export function RepositoryCombobox({
  value,
  onValueChange,
  placeholder = "Select repository..."
}: RepositoryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [repositories, setRepositories] = React.useState<Repository[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedRepo, setSelectedRepo] = React.useState<Repository | null>(null)
  const initRef = React.useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch repositories on component mount
  React.useEffect(() => {
    fetchRepositories()
  }, [])

  // Initialize selected repository from URL params or auto-select first repository (only once)
  React.useEffect(() => {
    if (repositories.length > 0 && !initRef.current) {
      initRef.current = true
      
      const repoFromUrl = searchParams.get('repo')
      const currentRepoId = value || repoFromUrl
      
      if (currentRepoId) {
        // Select repository from URL/props
        const repo = repositories.find(r => r.id === currentRepoId)
        setSelectedRepo(repo || null)
      } else {
        // Auto-select the first repository (most recent) for MVP
        const defaultRepo = repositories[0]
        if (defaultRepo) {
          setSelectedRepo(defaultRepo)
          
          // Call parent callback if provided
          if (onValueChange) {
            onValueChange(defaultRepo.id)
          }
          
          // Navigate to dashboard with the default repository
          router.push(`/dashboard?repo=${defaultRepo.id}`)
        }
      }
    }
  }, [repositories, value, searchParams, onValueChange, router])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      const data = await getRepositoriesSummary(50)
      setRepositories(data || [])
    } catch (error) {
      console.error('Error fetching repositories:', error)
      setRepositories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (repo: Repository) => {
    setSelectedRepo(repo)
    setOpen(false)
    
    // Call parent callback if provided
    if (onValueChange) {
      onValueChange(repo.id)
    }
    
    // Navigate only if not already on the correct page
    const currentRepoFromUrl = searchParams.get('repo')
    if (currentRepoFromUrl !== repo.id) {
      router.push(`/dashboard?repo=${repo.id}`)
    }
  }

  const formatDisplayText = (repo: Repository) => {
    return repo.name.length > 25 ? `${repo.name.substring(0, 25)}...` : repo.name
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedRepo ? formatDisplayText(selectedRepo) : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search repositories..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading repositories..." : "No repositories found."}
            </CommandEmpty>
            <CommandGroup>
              {repositories.map((repo) => (
                <CommandItem
                  key={repo.id}
                  value={`${repo.name} ${repo.githubUrl}`}
                  onSelect={() => handleSelect(repo)}
                  className="flex items-center gap-2 p-2"
                >
                  <GitBranch className="h-4 w-4" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">{repo.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {repo.totalCharacters && repo.totalCharacters > 0 
                        ? `${Math.round(repo.totalCharacters / 1000)}k characters`
                        : 'No analysis data'
                      }
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedRepo?.id === repo.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 