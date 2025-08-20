"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users, Shield, Star } from 'lucide-react'
import { ExpertForm } from './expert-form'
import { Expert } from '@/types/expert'

interface ExpertHeaderProps {
  totalExperts: number
  activeExperts: number
  defaultExperts: number
  onAddExpert: (expert: Expert) => void
}

export function ExpertHeader({ 
  totalExperts, 
  activeExperts, 
  defaultExperts,
  onAddExpert 
}: ExpertHeaderProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expert Frameworks</h1>
            <p className="text-muted-foreground mt-2">
              Manage investment expert frameworks for MOIC analysis
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Expert
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExperts}</p>
                <p className="text-sm text-muted-foreground">Total Experts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeExperts}</p>
                <p className="text-sm text-muted-foreground">Active Experts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Star className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{defaultExperts}</p>
                <p className="text-sm text-muted-foreground">Default Experts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ExpertForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={onAddExpert}
      />
    </>
  )
}