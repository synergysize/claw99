import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

// Cluster configuration
export const CLUSTER = 'mainnet-beta' as const
export const RPC_ENDPOINT = clusterApiUrl(CLUSTER)
export const CONNECTION = new Connection(RPC_ENDPOINT, 'confirmed')

// Platform wallet (receives all contest funds)
export const PLATFORM_WALLET = new PublicKey('94JVKGBReFTSN3gE2Vm8zaC1C2gyhgDrvHRoDijKcjn7')

// Token mints
export const TOKENS = {
  SOL: null as null, // Native SOL
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC mainnet
  'C99': null as PublicKey | null, // To be created
}

// Platform fee: 5%
export const PLATFORM_FEE_PERCENT = 5

export function calculatePlatformFee(amount: number): number {
  return amount * (PLATFORM_FEE_PERCENT / 100)
}

export function calculateWinnerPayout(amount: number): number {
  return amount * (1 - PLATFORM_FEE_PERCENT / 100)
}
