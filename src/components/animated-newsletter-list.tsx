"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/magicui/animated-list"
import { motion } from "motion/react"

interface NotificationItem {
  text: string
  date: string
  time: string
  icon: string
  color: string
}

let notifications = [
  {
    text: "New Newsletter",
    date: "January 8, 2025",
    time: "2m ago",
    icon: "📧",
    color: "#00C9A7",
  },
  {
    text: "New Newsletter",
    date: "January 1, 2025",
    time: "1w ago",
    icon: "📧",
    color: "#FFB800",
  },
  {
    text: "New Newsletter",
    date: "December 25, 2024",
    time: "2w ago",
    icon: "📧",
    color: "#FF3D71",
  },
  {
    text: "New Newsletter",
    date: "December 18, 2024",
    time: "3w ago",
    icon: "📧",
    color: "#1E86FF",
  },
  {
    text: "New Newsletter",
    date: "December 11, 2024",
    time: "4w ago",
    icon: "📧",
    color: "#9333EA",
  },
]

// Repeat array for continuous scrolling effect
notifications = Array.from({ length: 5 }, () => notifications).flat()

const Notification = ({ text, date, time, icon, color }: NotificationItem) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-lg p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <motion.div
          className="flex size-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: color,
          }}
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
        >
          <span className="text-lg">{icon}</span>
        </motion.div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{text}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
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
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-2/3 bg-gradient-to-t from-gray-100 via-gray-100/95 dark:from-gray-900 dark:via-gray-900/95 to-transparent"></div>
    </div>
  )
}