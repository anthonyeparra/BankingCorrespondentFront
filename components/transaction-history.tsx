"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { Transaction, ApiResponseTransaction, TransactionType } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

interface TransactionHistoryProps {
    correspondentId: string
    transactionTypes: TransactionType[]
    reloadKey: number
}

export function TransactionHistory({ correspondentId, transactionTypes, reloadKey }: TransactionHistoryProps) {


    const [transactions, setTransactions] = useState<Transaction[]>([])
    const { token } = useAuth()
    const [filter, setFilter] = useState<string>("0")
    const apiUrl = "https://4jve2k1hc2.execute-api.us-east-1.amazonaws.com/dev"

    useEffect(() => {

    const fetchHistory = async () => {
      try {
        const url = new URL(`${apiUrl}/transaction`)
        url.searchParams.append("correspondent_id", correspondentId)
        if (filter !== "0") {
            url.searchParams.append("transaction_type_id", filter)
        }
        const res = await fetch(
          url.toString(), {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        )
        const json: ApiResponseTransaction = await res.json()

        if (json.status === 200 && json.data.length > 0 && Array.isArray(json.data)) {
          const data_formatted = json.data.map((c) => ({
            ...c,
            created_at: new Date(c.created_at),
          }))

          setTransactions(data_formatted)
        } else {
          console.error("Respuesta inesperada:", json)
        }
      } catch (err: any) {
        console.error("Error al consumir la API:", err)
      }
    }

    fetchHistory()

    }, [filter, reloadKey])


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>Registro de todas las operaciones realizadas</CardDescription>
          </div>
          <div className="w-full sm:w-48">
            <Select value={filter} onValueChange={(value) => setFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="0" value="0">Todas las operaciones</SelectItem>
                {
                  transactionTypes.map((transactionType) => (
                    <SelectItem key={transactionType.transaction_type_id} value={transactionType.transaction_type_id.toString()}>
                      Solo {transactionType.name.toLowerCase()}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {transactions.map((transaction) => {
                const IconComponent = Icons[transaction.icon_code as keyof typeof Icons] as LucideIcon

                return (
                    <TableRow key={transaction.transaction_id}>
                    <TableCell className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{transaction.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">
                        {formatCurrency(transaction.amount_to_withdraw)}
                    </TableCell>
                    </TableRow>
                )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No hay transacciones para mostrar</p>
            {filter !== "all" && (
              <p className="text-sm text-muted-foreground mt-1">Prueba cambiando el filtro para ver más resultados</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

