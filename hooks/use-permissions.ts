export { usePermissions } from "@/contexts/permission-context"

import { useMemo } from "react"
import { usePermissions } from "@/contexts/permission-context"

export function useHasPermission(...codes: string[]): boolean {
  const { hasAnyPermission } = usePermissions()
  return useMemo(() => hasAnyPermission(...codes), [hasAnyPermission, ...codes])
}

export function useAccessibleModules(): string[] {
  const { sidebar } = usePermissions()
  return useMemo(() => sidebar.map((item) => item.module), [sidebar])
}