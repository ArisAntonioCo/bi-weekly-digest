"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/(auth)/login/actions"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    await login(formData)
  }

  return (
    <Card className="w-full max-w-md animate-in fade-in zoom-in-50 slide-in-from-bottom-8 duration-700 fill-mode-both">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          Sign in to your admin account to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="pt-2">
            <Button 
            type="submit" 
            className={`w-full transition-all duration-300 transform ${
              isLoading 
                ? 'cursor-not-allowed opacity-90 scale-[0.98]' 
                : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <div className="absolute inset-0 h-4 w-4 animate-ping opacity-25">
                    <Loader2 className="h-4 w-4" />
                  </div>
                </div>
                <span className="animate-pulse">Signing in...</span>
              </div>
            ) : (
              <span className="font-medium">Sign In</span>
            )}
          </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
