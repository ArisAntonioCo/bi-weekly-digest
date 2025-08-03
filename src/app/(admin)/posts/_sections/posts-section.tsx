"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, FileText, Calendar, Eye } from 'lucide-react'

const posts = [
  {
    id: 1,
    title: "Getting Started with AI Content Creation",
    status: "Published",
    date: "2024-01-15",
    views: 234
  },
  {
    id: 2,
    title: "Newsletter Best Practices",
    status: "Draft",
    date: "2024-01-10",
    views: 0
  },
  {
    id: 3,
    title: "Automating Your Content Workflow",
    status: "Published",
    date: "2024-01-05",
    views: 156
  }
]

export function PostsSection() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Post
        </Button>
      </div>
      
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} views
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}