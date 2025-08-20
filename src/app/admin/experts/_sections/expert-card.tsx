"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Edit, Trash, Shield, Star, StarOff } from 'lucide-react'
import { Expert } from '@/types/expert'
import { ExpertForm } from './expert-form'
import { toast } from 'sonner'

interface ExpertCardProps {
  expert: Expert
  onUpdate: (expert: Expert) => void
  onDelete: (expertId: string) => void
}

export function ExpertCard({ expert, onUpdate, onDelete }: ExpertCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleActive = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/experts/${expert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !expert.is_active }),
      })

      if (!response.ok) throw new Error('Failed to update expert')

      const updatedExpert = await response.json()
      onUpdate({ ...expert, is_active: !expert.is_active })
      toast.success(`Expert ${!expert.is_active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update expert status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleDefault = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/experts/${expert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: !expert.is_default }),
      })

      if (!response.ok) throw new Error('Failed to update expert')

      const updatedExpert = await response.json()
      onUpdate({ ...expert, is_default: !expert.is_default })
      toast.success(`Expert ${!expert.is_default ? 'set as default' : 'removed from defaults'}`)
    } catch (error) {
      toast.error('Failed to update expert default status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/experts/${expert.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete expert')

      onDelete(expert.id)
      toast.success('Expert deleted successfully')
    } catch (error) {
      toast.error('Failed to delete expert')
    }
    setIsDeleteOpen(false)
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'value': return 'bg-blue-500/10 text-blue-500'
      case 'growth': return 'bg-green-500/10 text-green-500'
      case 'tech': return 'bg-purple-500/10 text-purple-500'
      case 'macro': return 'bg-orange-500/10 text-orange-500'
      case 'custom': return 'bg-gray-500/10 text-gray-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <>
      <Card className="relative overflow-hidden border border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{expert.name}</h3>
                {expert.is_default && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              {expert.title && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {expert.title}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleDefault}>
                  {expert.is_default ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Remove from Defaults
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Set as Default
                    </>
                  )}
                </DropdownMenuItem>
                {!expert.is_default && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {expert.category && (
            <Badge className={getCategoryColor(expert.category)} variant="secondary">
              {expert.category}
            </Badge>
          )}

          {expert.focus_areas && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Focus Areas</p>
              <p className="text-sm line-clamp-2">{expert.focus_areas}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Investing Law</p>
            <p className="text-sm italic line-clamp-3">"{expert.investing_law}"</p>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Switch
                checked={expert.is_active}
                onCheckedChange={handleToggleActive}
                disabled={isUpdating}
              />
              <span className="text-sm text-muted-foreground">
                {expert.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {expert.is_default && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      <ExpertForm
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={onUpdate}
        expert={expert}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{expert.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}