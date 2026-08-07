"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster, type ToasterProps } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme"theme"]}
      className="toaster group"
      icons={{
        success="size-4" />,
        info="size-4" />,
        warning="size-4" />,
        error="size-4" />,
        loading="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        }.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
