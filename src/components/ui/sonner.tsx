"use client"

import { useTheme } from "@/providers/selective-theme-provider"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system", isExcludedPath } = useTheme()
  // Always use light theme for toasts on excluded paths
  const toastTheme = isExcludedPath ? "light" : theme

  return (
    <Sonner
      theme={toastTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
