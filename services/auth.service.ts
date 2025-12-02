import apiClient from "@/lib/api-client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "director" | "head_teacher" | "class_teacher" | "bursar"
    status: string
    isDirector: boolean
  }
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  name: string
  email: string
  firstName: string
  lastName: string
  role: "director" | "head_teacher" | "class_teacher" | "bursar"
  status: string
  isDirector: boolean
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", credentials)
      
      const { user, accessToken, refreshToken } = response.data

      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      // Transform user data to match our User interface
      const transformedUser: User = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isDirector: user.isDirector,
      }

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(transformedUser))

      return {
        user: transformedUser,
        tokens: { accessToken, refreshToken },
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password")
      } else if (error.response?.status === 403) {
        throw new Error("Account is not active. Please contact administrator.")
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please check your connection.")
      } else if (!error.response) {
        throw new Error("Unable to connect to server. Please try again later.")
      }
      
      throw new Error(error.response?.data?.message || "Login failed. Please try again.")
    }
  }

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint if your backend has one
      // await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear all stored data
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    // Check if we're on the client side
    if (typeof window === "undefined") return null
    
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return null

      const user = JSON.parse(userStr)
      
      // Validate user data
      if (user && user.id && user.email && user.role) {
        return user
      }
      
      return null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // Check if we're on the client side
    if (typeof window === "undefined") return false
    
    const token = localStorage.getItem("accessToken")
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    // Check if we're on the client side
    if (typeof window === "undefined") return null
    return localStorage.getItem("accessToken")
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    // Check if we're on the client side
    if (typeof window === "undefined") return null
    return localStorage.getItem("refreshToken")
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post("/auth/forgot-password", { email })
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("No account found with this email address")
      }
      throw new Error(error.response?.data?.message || "Failed to send reset email")
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post("/auth/reset-password", { token, password })
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Invalid or expired reset token")
      }
      throw new Error(error.response?.data?.message || "Failed to reset password")
    }
  }

  /**
   * Setup new account with token
   */
  async setupAccount(data: {
    token: string
    firstName: string
    lastName: string
    password: string
  }): Promise<void> {
    try {
      await apiClient.post("/auth/setup-account", data)
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Invalid or expired setup token")
      }
      if (error.response?.status === 409) {
        throw new Error("This account has already been setup")
      }
      throw new Error(error.response?.data?.message || "Failed to setup account")
    }
  }
}

export const authService = new AuthService()