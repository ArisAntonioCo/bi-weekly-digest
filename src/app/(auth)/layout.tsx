import { AuthPanel } from "@/components/auth-panel"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthPanel>{children}</AuthPanel>
}