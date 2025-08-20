"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export function PageHeader() {
  const router = useRouter()
  
  return (
    <>
      {/* Back Button */}
      <div className="absolute top-0 left-0 p-6">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-20 pb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Expert Stock Analysis
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get AI-powered insights through the lens of legendary investors
        </p>
      </motion.div>
    </>
  )
}