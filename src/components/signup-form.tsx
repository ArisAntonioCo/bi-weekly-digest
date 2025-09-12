"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PrivacyContent } from "@/components/legal/privacy-content"
import { TermsContent } from "@/components/legal/terms-content"
import { formatLastUpdated } from "@/config/legal"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock } from "lucide-react"
export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agree, setAgree] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            agreed_to_terms_at: new Date().toISOString(),
          },
        },
      })

      if (error) {
        setError(error.message)
      } else if (data?.user) {
        // User created successfully
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-1 mb-8">
        <h2 className="text-2xl font-bold text-center text-foreground">
          Create an account
        </h2>
        <p className="text-center text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <form onSubmit={handleSignUp}>
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
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground text-base">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground text-base">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="agree"
              checked={agree}
              onCheckedChange={(v) => setAgree(Boolean(v))}
              className="mt-1"
              disabled={loading}
              aria-invalid={!agree}
            />
            <Label htmlFor="agree" className="text-sm text-muted-foreground leading-relaxed">
              I agree to the{' '}
              <Dialog open={showTerms} onOpenChange={setShowTerms}>
                <DialogTrigger asChild>
                  <button type="button" className="underline underline-offset-4 text-foreground hover:text-primary">
                    Terms of Service
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[70vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Consumer Terms of Service</DialogTitle>
                  </DialogHeader>
                  <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">Effective {formatLastUpdated()}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> 1 min read</span>
                  </div>
                  <hr className="mb-4 border-border" />
                  <TermsContent />
                </DialogContent>
              </Dialog>
              {' '}and{' '}
              <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
                <DialogTrigger asChild>
                  <button type="button" className="underline underline-offset-4 text-foreground hover:text-primary">
                    Privacy Policy
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[70vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Privacy Policy</DialogTitle>
                  </DialogHeader>
                  <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">Effective {formatLastUpdated()}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> 1 min read</span>
                  </div>
                  <hr className="mb-4 border-border" />
                  <PrivacyContent />
                </DialogContent>
              </Dialog>
            </Label>
          </div>
        </div>
        <div className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading || !agree}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-foreground hover:text-primary underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
