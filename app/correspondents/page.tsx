"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CorrespondentCard } from "@/components/correspondent-card"
import { PageTitle } from "@/components/page-title"
import { Correspondent, ApiResponseCorrespondent } from "@/lib/data"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ErrorModal } from "@/components/error-modal"
import { LogOut, User } from "lucide-react"

export default function CorrespondentsPage() {
  const { token, logout } = useAuth()
  const router = useRouter()
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
  const [correspondents, setCorrespondents] = useState<Correspondent[]>([])
  const [loading, setLoading] = useState(true)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "No es posible realizar esta operación. Contacte con el administrador del sistema."
  )
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }

    const fetchCorrespondents = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/resources/correspondent`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        )
        const json: ApiResponseCorrespondent = await res.json()

        if (json.status === 200 && json.data.length > 0 && Array.isArray(json.data)) {
          const data_formatted = json.data.map((c) => ({
            ...c,
            quota_date: new Date(c.quota_date),
          }))

          setCorrespondents(data_formatted)
        } else {
          console.error("Respuesta inesperada:", json)
        }
      } catch (err: any) {
        setErrorMessage(`"No es posible realizar esta operación: ${err.message} "`)
        setIsErrorModalOpen(true)
        console.error("Error al consumir la API:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCorrespondents()
  }, [token, router])

  if (!token) {
    return null
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <PageTitle
          title="Corresponsales Bancarios"
          description="Seleccione un corresponsal para realizar operaciones"
        />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>{userInfo.first_name} {userInfo.last_name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Cargando corresponsales...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {correspondents.map((correspondent) => (
            <CorrespondentCard key={correspondent.correspondent_id} correspondent={correspondent} />
          ))}
        </div>
      )}

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
    </main>
  )
}
