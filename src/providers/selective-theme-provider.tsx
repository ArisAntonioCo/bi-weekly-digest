"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  excludedPaths?: string[]
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isExcludedPath: boolean
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isExcludedPath: false,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function SelectiveThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "bi-weekly-digest-theme",
  excludedPaths = [],
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()
  
  // Check if current path should be excluded from theming
  const isExcludedPath = React.useMemo(() => {
    return excludedPaths.some(path => {
      if (path.endsWith('*')) {
        return pathname.startsWith(path.slice(0, -1))
      }
      return pathname === path
    })
  }, [pathname, excludedPaths])

  React.useEffect(() => {
    setMounted(true)
    // Only load theme from storage if not on excluded path
    if (!isExcludedPath) {
      const stored = localStorage.getItem(storageKey) as Theme
      if (stored) {
        setTheme(stored)
      }
    }
  }, [storageKey, isExcludedPath])

  React.useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Always remove existing theme classes
    root.classList.remove("light", "dark")

    // If on excluded path, always use light theme
    if (isExcludedPath) {
      root.classList.add("light")
      return
    }

    // Apply selected theme for non-excluded paths
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, mounted, isExcludedPath])

  const value = {
    theme: isExcludedPath ? "light" : theme,
    setTheme: (newTheme: Theme) => {
      // Only allow theme changes on non-excluded paths
      if (!isExcludedPath) {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      }
    },
    isExcludedPath,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a SelectiveThemeProvider")

  return context
}