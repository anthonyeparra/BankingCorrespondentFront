import * as Icons from "lucide-react"

export interface Correspondent {
  correspondent_id: number
  name: string
  maximum_capacity: number
  available_space: number
  quota_date: Date
  address: string
}

export interface ApiResponseCorrespondent {
  status: number
  description: string
  data: Correspondent[] | string
}

export interface ApiResponseTransactionType {
  status: number
  description: string
  data: TransactionType[] | string
}

export interface TransactionType {
  transaction_type_id: number
  name: string
  icon_code: keyof typeof Icons
}

export interface ApiResponseTransaction {
  status: number
  description: string
  data: Transaction[] | string
}

export interface Transaction {
  transaction_id: number
  name: string
  amount_to_withdraw: number
  icon_code: keyof typeof Icons
  created_at: Date
}