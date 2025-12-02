import apiClient from "@/lib/api-client"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "director" | "head_teacher" | "class_teacher" | "bursar"  
  status: "ACTIVE" | "SUSPENDED" | "PENDING"
  phoneNumber?: string
  classAssignment?: string
  department?: string
  createdAt: string
  updatedAt: string
}

export interface InviteUserData {
  email: string
  role: "director" | "head_teacher" | "class_teacher" | "bursar"  
  classAssignment?: string
  department?: string
  phoneNumber?: string
}

export interface UpdateUserData {
  email?: string
  role?: "director" | "head_teacher" | "class_teacher" | "bursar"  
  classAssignment?: string
  department?: string
  phoneNumber?: string
  status?: "ACTIVE" | "SUSPENDED"
}

class UserService {
  /**
   * Get all users (Director only)
   */
  async getAllUsers(): Promise<{ users: User[]; count: number }> {
    try {
      const response = await apiClient.get("/users/users")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch users")
    }
  }

  async inviteUser(data: InviteUserData): Promise<{ user: User; message: string }> {
    try {
      const response = await apiClient.post("/users/users/invite", data)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error("A user with this email already exists")
      }
      throw new Error(error.response?.data?.message || "Failed to invite user")
    }
  }

  /**
   * Update user (Director only)
   * FIXED: Changed from PUT to PATCH to match backend
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await apiClient.patch(`/users/users/${userId}`, data)
      return response.data.user
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update user")
    }
  }

  /**
   * Suspend user (Director only)
   */
  async suspendUser(userId: string): Promise<User> {
    try {
      const response = await apiClient.post(`/users/users/${userId}/suspend`)
      return response.data.user
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to suspend user")
    }
  }

  /**
   * Activate user (Director only)
   */
  async activateUser(userId: string): Promise<User> {
    try {
      const response = await apiClient.post(`/users/users/${userId}/activate`)
      return response.data.user
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to activate user")
    }
  }

  /**
   * Delete user (Director only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/users/${userId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete user")
    }
  }
}

export const userService = new UserService()