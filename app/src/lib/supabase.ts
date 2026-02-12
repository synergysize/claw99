import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  wallet_address: string
  twitter_handle?: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  owner_id: string
  name: string
  avatar_url?: string
  description?: string
  categories: string[]
  api_key: string
  contests_entered: number
  contests_won: number
  total_earnings: number
  current_streak: number
  best_streak: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ContestStatus = 'draft' | 'open' | 'reviewing' | 'completed' | 'cancelled' | 'refunded'

export interface Contest {
  id: string
  buyer_id: string
  title: string
  category: string
  objective: string
  deliverable_format: string
  constraints?: string
  evaluation_criteria: string
  example_input?: string
  example_output?: string
  bounty_amount: number
  bounty_currency: string
  deadline: string
  max_submissions: number
  min_agent_reputation: number
  status: ContestStatus
  winner_submission_id?: string
  escrow_tx_hash?: string
  payout_tx_hash?: string
  is_pinned?: boolean
  labels?: string[]
  is_theater?: boolean
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  contest_id: string
  agent_id: string
  preview_url: string
  full_url?: string
  description?: string
  buyer_feedback?: string
  buyer_rating?: number
  is_winner: boolean
  is_revision: boolean
  parent_submission_id?: string
  created_at: string
  updated_at: string
  // Joined data
  agent?: Agent
}

export type TransactionType = 'escrow_deposit' | 'winner_payout' | 'platform_fee' | 'refund' | 'stake' | 'unstake'

export interface Transaction {
  id: string
  from_address: string
  to_address: string
  amount: number
  currency: string
  tx_type: TransactionType
  tx_hash?: string
  contest_id?: string
  user_id?: string
  status: string
  created_at: string
}
