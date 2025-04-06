"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TransactionType } from "@/lib/data"
import { ErrorModal } from "@/components/error-modal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface OperationForm {
  correspondentId: number | string
  refreshCorrespondent: () => void
  transactionTypes: TransactionType[]
  refreshTransactions: () => void
}

export function OperationForm({ correspondentId, refreshCorrespondent, transactionTypes, refreshTransactions }: OperationForm) { 
  const [operationType, setOperationType] = useState<string>("Desposito")
  const [operationTypeId, setOperationTypeId] = useState<number | null>(1)
  const [amount, setAmount] = useState("")
  const { token } = useAuth()
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    "No es posible realizar esta operación. Contacte con el administrador del sistema."
  )
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = Number.parseFloat(amount)
  
    if (isNaN(numAmount) || numAmount <= 0 || !operationTypeId || !correspondentId) {
      return
    }
  
    try {
      const response = await fetch(`${apiUrl}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transaction_type_id: operationTypeId,
          correspondent_id: correspondentId,
          amount: numAmount
        })
      })
  
      const data = await response.json()
  
      if (data.status == 200) {
        console.log("Respuesta de la API:", data)
        refreshCorrespondent()
        refreshTransactions()
      } else {
        console.error("Respuesta inesperada:", data)
        setErrorMessage(data.data)
        setIsErrorModalOpen(true)
      }
  
      setAmount("")
    } catch (err: any) {
      setErrorMessage(`"No es posible realizar esta operación: ${err.message} "`)
      setIsErrorModalOpen(true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Realizar Operación</CardTitle>
        <CardDescription>Deposite o retire dinero</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de Operación</Label>
            <RadioGroup
              value={operationType}
              onValueChange={
                (value) => {
                  setOperationType(value as "Desposito" | "Retiro")
                  const selected = transactionTypes.find((item) => item.name === value)
                  setOperationTypeId(selected?.transaction_type_id ?? null)
                }
                
              }
              className="grid grid-cols-2 gap-4"
            >

          {transactionTypes.map((item) => {
            const IconComponent = Icons[item.icon_code as keyof typeof Icons] as LucideIcon

            return (
              <div key={item.transaction_type_id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={item.name}
                  id={String(item.transaction_type_id)}
                />
                <Label
                  htmlFor={String(item.transaction_type_id)}
                  className="flex items-center cursor-pointer"
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                  {item.name}
                </Label>
              </div>
            )
          })}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />           
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Realizar {operationType}
          </Button>
        </CardFooter>
      </form>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
    </Card>
  )
}

