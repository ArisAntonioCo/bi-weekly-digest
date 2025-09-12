import { ConfirmPage } from './_page/confirm-page'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  return <ConfirmPage searchParams={sp} />
}
