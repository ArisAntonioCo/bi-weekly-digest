import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-zinc-100 text-zinc-900 flex size-8 items-center justify-center rounded-md">
            <TrendingUp className="size-5" />
          </div>
          <span className="text-xl font-semibold text-zinc-100">Weekly Digest</span>
        </Link>
        <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}