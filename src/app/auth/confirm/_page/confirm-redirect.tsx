import { redirect } from 'next/navigation'

export function ConfirmRedirect({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined }
}) {
  const next = (typeof searchParams.next === 'string' && searchParams.next) || '/login'
  const dest = next.startsWith('/login') ? '/login?confirmed=1' : next
  redirect(dest)
  return null
}

export default ConfirmRedirect
