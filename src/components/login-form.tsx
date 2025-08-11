"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/(auth)/login/actions"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/ui/logo"

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
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <Logo
          variant="sm"
          href={undefined}
          textClassName="text-foreground"
        />
      </div>
      <div className="space-y-1 mb-8">
        <h2 className="text-2xl font-bold text-center text-foreground">
          Sign In
        </h2>
        <p className="text-center text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {error && (
            <Alert className="bg-destructive/10 border-destructive/20">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground text-base">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isLoading}
              className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground text-base">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-foreground hover:text-primary underline underline-offset-4"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
