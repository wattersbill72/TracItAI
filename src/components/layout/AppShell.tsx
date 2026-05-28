import { ReactNode } from 'react'

export default function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
