"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthContextType {
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/get-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.status === 200) {
        localStorage.setItem("token", data.data.Idtoken)
        try {
          const userInfo = await fetch(`${apiUrl}/users`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.data.Idtoken}`
            }
          })

          const userInfoData = await userInfo.json()
          localStorage.setItem("user", JSON.stringify(userInfoData.data))
        } catch (error) {
          console.error("Error al obtener información del usuario:", error)
        }
        setToken(data.data.Idtoken)
        return { success: true }
      } else {
        return { success: false, message: data.data.toString() }
      }
    } catch (error) {
      return { success: false, message: "Ocurrió un error al iniciar sesión" }
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem("token")
  }

  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={{ token, login , logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

