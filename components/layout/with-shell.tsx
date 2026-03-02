'use client'

import { AppShell } from './app-shell'

export function WithShell({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
