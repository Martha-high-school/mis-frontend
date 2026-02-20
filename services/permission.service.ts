import apiClient from "@/lib/api-client"

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarItem {
  module: string
  label: string
  icon: string
  path: string
  permissions: string[]
}

export interface MyPermissionsResponse {
  role: string
  permissions: string[]
  sidebar: SidebarItem[]
}

export interface PermissionModule {
  module: string
  label: string
  icon: string
  permissions: {
    code: string
    action: string
    description: string
  }[]
}

export interface PermissionDetail {
  code: string
  module: string
  action: string
  description: string
  fromRole: boolean
  override: {
    granted: boolean
    grantedBy: string | null
    updatedAt: string
  } | null
  effective: boolean
}

export interface UserPermissionDetails {
  user: {
    id: string
    role: string
    firstName: string
    lastName: string
    email: string
  }
  permissions: PermissionDetail[]
}

// ============================================================================
// SERVICE
// ============================================================================

class PermissionService {
  /**
   * Get current user's permissions and sidebar modules.
   * Call this on login / app load and store the result.
   */
  async getMyPermissions(): Promise<MyPermissionsResponse> {
    const response = await apiClient.get<MyPermissionsResponse>("/permissions/me")
    return response.data
  }

  /**
   * Get all permissions grouped by module (admin UI)
   */
  async getAllPermissions(): Promise<{ modules: PermissionModule[] }> {
    const response = await apiClient.get("/permissions/all")
    return response.data
  }

  /**
   * Get detailed permissions for a specific user (admin UI)
   */
  async getUserPermissions(userId: string): Promise<UserPermissionDetails> {
    const response = await apiClient.get(`/permissions/users/${userId}`)
    return response.data
  }

  /**
   * Grant extra permissions to a user
   */
  async grantPermissions(
    userId: string,
    permissions: string[]
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/permissions/users/${userId}/grant`, {
      permissions,
    })
    return response.data
  }

  /**
   * Revoke permissions from a user
   */
  async revokePermissions(
    userId: string,
    permissions: string[]
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/permissions/users/${userId}/revoke`, {
      permissions,
    })
    return response.data
  }

  /**
   * Reset user to role defaults
   */
  async resetPermissions(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/permissions/users/${userId}/reset`)
    return response.data
  }

  /**
   * Set exact permissions for a user (replaces all overrides)
   */
  async setUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<UserPermissionDetails> {
    const response = await apiClient.post(`/permissions/users/${userId}/set`, {
      permissions,
    })
    return response.data
  }
}

export const permissionService = new PermissionService()