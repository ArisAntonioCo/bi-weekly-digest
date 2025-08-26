"use client"

import { useState, useEffect } from 'react'
import { SystemPromptEditor, ConfigurationHeader } from '../_sections'
import { toast } from 'sonner'
import { Configuration } from '@/types/configuration'

export function ConfigurationPage() {
  const [config, setConfig] = useState<Configuration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/api/config')
      if (!response.ok) {
        throw new Error('Failed to fetch configuration')
      }
      const data = await response.json()
      setConfig(data.configuration)
    } catch (error) {
      toast.error('Failed to load configuration')
      console.error('Config fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (systemPrompt: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ system_prompt: systemPrompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      const data = await response.json()
      setConfig(data.configuration)
      toast.success('System prompt updated successfully!')
      
      // Refresh blogs to reflect new system prompt
      setTimeout(() => {
        toast.info('Blog content will be updated to reflect the new configuration')
      }, 1000)
      
    } catch (error) {
      toast.error('Failed to save configuration')
      console.error('Config save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        <div className="space-y-3">
          <ConfigurationHeader />
          <SystemPromptEditor
            config={config}
            loading={loading}
            saving={saving}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}