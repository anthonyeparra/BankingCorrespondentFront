"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OperationForm } from "@/components/operation-form"
import { ErrorModal } from "@/components/error-modal"
import { TransactionHistory } from "@/components/transaction-history"
import { ArrowLeft, LogOut, User } from "lucide-react"
import { Correspondent, ApiResponseCorrespondent, TransactionType, ApiResponseTransactionType } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { use } from "react"
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL


export default function CorrespondentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { token, logout } = useAuth()
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
  const { id } = use(params)
  const [correspondent, setCorrespondent] = useState<Correspondent | null>(null)
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([])
  const [balance, setBalance] = useState(0)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "No es posible realizar esta operación. Contacte con el administrador del sistema."
  )
  const [reloadKey, setReloadKey] = useState(0)
  const refreshTransactions = () => {
    setReloadKey(prev => prev + 1)
  }

  const fetchCorrespondents = async () => {
    try {
      const res = await fetch(
        `${apiUrl}/resources/correspondent?correspondent_id=${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )
      const json: ApiResponseCorrespondent = await res.json()

      if (json.status === 200 && Array.isArray(json.data)) {
        const data = json.data[0]

        const data_formatted = {
          ...data,
          quota_date: new Date(data.quota_date),
        }

        setCorrespondent(data_formatted)
        setBalance(data_formatted.available_space)
      } else {
        console.error("Respuesta inesperada:", json)
        if (typeof json.data === "string") {
          setErrorMessage(json.data)
        }

        setIsErrorModalOpen(true)
      }
    } catch (err: any) {
      setErrorMessage(`"Error al consumir la API: ${err.message} "`)
      setIsErrorModalOpen(true)
      console.error("Error al consumir la API:", err)
    }
  }

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }

    const fetchTransactionTypes = async () => {
      try {
        const res = await fetch(
          "https://4jve2k1hc2.execute-api.us-east-1.amazonaws.com/dev/resources/transation_type", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        )
        const json: ApiResponseTransactionType = await res.json()
  
        if (json.status === 200 && json.data.length > 0 && Array.isArray(json.data)) {
          console.log("data", json.data)
          setTransactionTypes(json.data)
        } else {
          console.error("Respuesta inesperada:", json)
          if (typeof json.data === "string") {
            setErrorMessage(json.data)
          }
  
          setIsErrorModalOpen(true)
        }
      } catch (err: any) {
        setErrorMessage(`"Error al consumir la API: ${err.message} "`)
        setIsErrorModalOpen(true)
        console.error("Error al consumir la API:", err)
      }
    }

    fetchTransactionTypes()
    fetchCorrespondents()
  }, [token, router])

  if (!correspondent) {
    return (
      <div className="container mx-auto py-8 px-4">
        <PageTitle title="Corresponsal no encontrado" />
        <Button onClick={() => router.push("/correspondents")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    )
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push("/correspondents")} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

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

      <PageTitle title={correspondent.name} description={`Corresponsal ubicado en ${correspondent.address}`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Corresponsal</CardTitle>
            <CardDescription>Detalles y cupo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">

                <span className="text-muted-foreground">Código:</span>
                <span>{correspondent.correspondent_id}</span>

                <span className="text-muted-foreground">Ubicación:</span>
                <span>{correspondent.address}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="text-lg font-medium">Cupo Actual</div>
                <div className="text-3xl font-bold mt-2">{formatCurrency(balance)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <OperationForm 
          correspondentId={id}
          refreshCorrespondent={fetchCorrespondents}
          transactionTypes={transactionTypes}
          refreshTransactions={refreshTransactions}
        />
      </div>

      <div className="mt-8">
        <TransactionHistory 
        correspondentId={id} 
        transactionTypes={transactionTypes}
        reloadKey={reloadKey}
      />
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  )
}

