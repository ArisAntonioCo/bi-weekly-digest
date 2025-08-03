"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, Eye, Wand2 } from 'lucide-react'

export function CreatePostSection() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Blog Post</CardTitle>
            <CardDescription>
              Create engaging content for your bi-weekly digest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                placeholder="Enter your blog post title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea 
                id="excerpt"
                placeholder="Brief description of your post..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <Button variant="outline" size="sm">
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Assist
                </Button>
              </div>
              <Textarea 
                id="content"
                placeholder="Write your blog post content here..."
                rows={15}
                className="font-mono"
              />
            </div>
            
            <div className="flex gap-2">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="secondary">
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}