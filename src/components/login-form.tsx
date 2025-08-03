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
import { login, signup } from "@/app/(auth)/login/actions"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          Sign in to your admin account to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <form className="space-y-6">
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
            className={`w-full transition-all duration-200 ${isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-[1.02]'}`}
            formAction={async (formData) => {
              setIsLoading(true)
              await login(formData)
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
