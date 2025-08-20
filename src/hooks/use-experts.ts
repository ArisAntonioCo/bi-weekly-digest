import useSWR, { mutate } from 'swr'
import { Expert, CreateExpertInput, UpdateExpertInput } from '@/types/expert'
import { toast } from 'sonner'

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  return res.json()
}

// Hook for fetching experts list with filters
export function useExperts({
  search = '',
  category = 'all',
  status = 'all',
  type = 'all',
  sortBy = 'display_order',
  sortOrder = 'asc',
  page = 1,
  limit = 9,
} = {}) {
  const params = new URLSearchParams()
  
  if (search) params.append('search', search)
  if (category !== 'all') params.append('category', category)
  if (status !== 'all') params.append('active', status === 'active' ? 'true' : 'false')
  if (type !== 'all') params.append('type', type)
  params.append('sortBy', sortBy)
  params.append('sortOrder', sortOrder)
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    `/api/experts?${params}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    experts: data?.experts || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    revalidate,
  }
}

// Hook for fetching a single expert
export function useExpert(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    id ? `/api/experts/${id}` : null,
    fetcher
  )

  return {
    expert: data as Expert | undefined,
    isLoading,
    error,
    revalidate,
  }
}

// Hook for creating an expert
export function useCreateExpert() {
  const createExpert = async (data: CreateExpertInput) => {
    try {
      const response = await fetch('/api/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create expert')
      }

      const newExpert = await response.json()
      
      // Revalidate all expert lists
      mutate((key) => typeof key === 'string' && key.startsWith('/api/experts'))
      
      toast.success('Expert created successfully')
      return newExpert
    } catch (error) {
      toast.error('Failed to create expert')
      throw error
    }
  }

  return { createExpert }
}

// Hook for updating an expert
export function useUpdateExpert() {
  const updateExpert = async (id: string, data: UpdateExpertInput) => {
    try {
      const response = await fetch(`/api/experts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update expert')
      }

      const updatedExpert = await response.json()
      
      // Revalidate the specific expert and all lists
      mutate(`/api/experts/${id}`)
      mutate((key) => typeof key === 'string' && key.startsWith('/api/experts?'))
      
      toast.success('Expert updated successfully')
      return updatedExpert
    } catch (error) {
      toast.error('Failed to update expert')
      throw error
    }
  }

  return { updateExpert }
}

// Hook for deleting an expert
export function useDeleteExpert() {
  const deleteExpert = async (id: string) => {
    try {
      const response = await fetch(`/api/experts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expert')
      }
      
      // Revalidate all expert lists
      mutate((key) => typeof key === 'string' && key.startsWith('/api/experts'))
      
      toast.success('Expert deleted successfully')
    } catch (error) {
      toast.error('Failed to delete expert')
      throw error
    }
  }

  return { deleteExpert }
}

// Hook for bulk operations
export function useBulkUpdateExperts() {
  const bulkUpdate = async (
    expertIds: string[],
    action: 'activate' | 'deactivate' | 'delete'
  ) => {
    try {
      const response = await fetch('/api/experts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: expertIds, action }),
      })

      if (!response.ok) {
        throw new Error('Failed to perform bulk operation')
      }
      
      // Revalidate all expert lists
      mutate((key) => typeof key === 'string' && key.startsWith('/api/experts'))
      
      const actionText = action === 'delete' ? 'deleted' : 
                        action === 'activate' ? 'activated' : 'deactivated'
      toast.success(`${expertIds.length} experts ${actionText} successfully`)
    } catch (error) {
      toast.error('Failed to perform bulk operation')
      throw error
    }
  }

  return { bulkUpdate }
}

// Hook for toggling expert status (active/inactive)
export function useToggleExpertStatus() {
  const { updateExpert } = useUpdateExpert()

  const toggleStatus = async (expert: Expert) => {
    return updateExpert(expert.id, { is_active: !expert.is_active })
  }

  return { toggleStatus }
}

// Hook for toggling expert default status
export function useToggleExpertDefault() {
  const { updateExpert } = useUpdateExpert()

  const toggleDefault = async (expert: Expert) => {
    return updateExpert(expert.id, { is_default: !expert.is_default })
  }

  return { toggleDefault }
}

// Optimistic update helper (removed - use mutate directly with proper options)