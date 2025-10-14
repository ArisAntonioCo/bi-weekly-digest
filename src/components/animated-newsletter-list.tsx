"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/magicui/animated-list"
import { motion } from "motion/react"

interface NotificationItem {
  text: string
  date: string
  time: string
}

let notifications = [
  {
    text: "NVDA - 3Y Return Projection: 2.8x",
    date: "January 15, 2025",
    time: "2m ago",
  },
  {
    text: "TSLA - Weekly Investment Analysis",
    date: "January 8, 2025",
    time: "1w ago",
  },
  {
    text: "AAPL - Expert Framework Analysis",
    date: "January 1, 2025",
    time: "2w ago",
  },
  {
    text: "MSFT - 3Y Return Forecast: 2.3x",
    date: "December 25, 2025",
    time: "3w ago",
  },
  {
    text: "GOOGL - Weekly Digest Report",
    date: "December 18, 2025",
    time: "4w ago",
  },
]

// Repeat array for continuous scrolling effect
notifications = Array.from({ length: 3 }, () => notifications).flat()

const Notification = ({ text, date, time }: NotificationItem) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-lg p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // Use muted-foreground variable
        "bg-muted-foreground text-white",
        "shadow-sm hover:shadow-md",
        "transform-gpu",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <motion.div
          className="flex size-10 items-center justify-center rounded-full bg-foreground"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
        >
          <span className="text-lg">🔔</span>
        </motion.div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-white">
            <span className="text-sm sm:text-lg">{text}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-white/70">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-white/60">
            {date}
          </p>
        </div>
      </div>
    </figure>
  )
}

export function AnimatedNewsletterList({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
        className,
      )}
    >
      <AnimatedList delay={2000}>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-2/3 bg-gradient-to-t from-foreground via-foreground/95 to-transparent"></div>
    </div>
  )
}
