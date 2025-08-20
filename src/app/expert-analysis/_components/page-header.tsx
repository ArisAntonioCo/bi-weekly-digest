"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export function PageHeader() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto px-4 pt-6 pb-8">
      <div className="flex items-start justify-between">
        {/* Left side - Title and subtitle */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Expert Stock Analysis
          </h1>
          <p className="text-muted-foreground">
            Get AI-powered insights through the lens of legendary investors
          </p>
        </motion.div>

        {/* Right side - Back Button */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  )
}