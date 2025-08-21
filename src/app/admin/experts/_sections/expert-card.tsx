"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { MoreVertical, Edit, Trash } from 'lucide-react'
import { Expert } from '@/types/expert'
import { ExpertForm } from './expert-form'
import { useDeleteExpert } from '@/hooks/use-experts'

interface ExpertCardProps {
  expert: Expert
  onUpdate: (expert: Expert) => void
  onDelete: (expertId: string) => void
}

export function ExpertCard({ expert, onUpdate, onDelete }: ExpertCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const { deleteExpert } = useDeleteExpert()

  const handleDelete = async () => {
    try {
      await deleteExpert(expert.id)
      onDelete(expert.id)
    } catch {
      // Error is handled by the hook with toast
    }
    setIsDeleteOpen(false)
  }

  return (
    <>
      <Card className="relative border border-border/50 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg">{expert.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 h-5">
                {expert.title || ' '}
              </p>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Investing Law</p>
            <p className="text-sm italic line-clamp-3 min-h-[3.75rem]">&ldquo;{expert.investing_law}&rdquo;</p>
          </div>

          {expert.framework_description && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Framework Description</p>
              <p className="text-sm line-clamp-2 min-h-[2.5rem]">{expert.framework_description}</p>
            </div>
          )}
        </CardContent>

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
              Are you sure you want to delete &ldquo;{expert.name}&rdquo;? This action cannot be undone.
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