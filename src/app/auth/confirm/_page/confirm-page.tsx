import Link from 'next/link'

export function ConfirmPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined }
}) {
  const token_hash = typeof searchParams.token_hash === 'string' ? searchParams.token_hash : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''
  const next = typeof searchParams.next === 'string' ? searchParams.next : '/login'
  const email = typeof searchParams.email === 'string' ? searchParams.email : ''

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border p-6 bg-card text-card-foreground">
        <h1 className="text-xl font-semibold mb-2">Confirm your email</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to complete verification.
        </p>
        <form method="post" action="/auth/confirm/verify" className="space-y-3">
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            className="w-full h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Confirm email
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          If this was opened automatically by your email client, it won&apos;t confirm until you press the button.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Already confirmed? <Link href="/login" className="underline underline-offset-4">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default ConfirmPage

