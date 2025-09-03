"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ExpertForm } from './expert-form'
import { Expert } from '@/types/expert'
import { motion } from 'motion/react'
import { format } from 'date-fns'

interface ExpertHeaderProps {
  totalExperts: number
  onAddExpert: (expert: Expert) => void
}

export function ExpertHeader({ 
  totalExperts, 
  onAddExpert 
}: ExpertHeaderProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <>
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Expert Frameworks Management
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="font-medium">{totalExperts} {totalExperts === 1 ? 'expert' : 'experts'}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="default"
              size="default"
              className="rounded-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expert
            </Button>
          </div>
        </div>
      </motion.div>

      <ExpertForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={onAddExpert}
      />
    </>
  )
}