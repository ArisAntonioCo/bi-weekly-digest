"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard-card'
import { Plus, Users } from 'lucide-react'
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
        className="mb-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Expert Frameworks Management
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
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

      {/* Quick Stats Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-3"
      >
        <StatCard
          label="Total Experts"
          value={totalExperts}
          icon={
            <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
              <Users className="h-5 w-5 text-foreground" />
            </div>
          }
        />
      </motion.div>

      <ExpertForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={onAddExpert}
      />
    </>
  )
}