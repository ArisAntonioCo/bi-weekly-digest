import ConfirmRedirect from './_page/confirm-redirect'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  return <ConfirmRedirect searchParams={sp} />
}
