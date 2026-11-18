"use client"

import { useEffect, useState } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/** Tema vindo do data-theme do <html> (no lugar do next-themes do shadcn). */
function useTemaDoSite(): "light" | "dark" {
  const [tema, setTema] = useState<"light" | "dark">("light")
  useEffect(() => {
    const raiz = document.documentElement
    const ler = () => setTema(raiz.dataset.theme === "dark" ? "dark" : "light")
    ler()
    const obs = new MutationObserver(ler)
    obs.observe(raiz, { attributes: true, attributeFilter: ["data-theme"] })
    return () => obs.disconnect()
  }, [])
  return tema
}

const Toaster = ({ ...props }: ToasterProps) => {
  const tema = useTemaDoSite()
  return (
    <Sonner
      theme={tema}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
