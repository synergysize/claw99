import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'CLAW99',
  projectId: 'claw99-marketplace', // Replace with WalletConnect project ID
  chains: [base, baseSepolia],
  ssr: false,
})

// Platform wallet address
export const PLATFORM_WALLET = '0x9fc988785362C0206923D96932DbE0538b15c8aC'

// Token addresses on Base
export const TOKENS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  CLAW99: '', // To be deployed
}

// Contract addresses (update after deployment)
export const CONTRACTS = {
  ESCROW: '', // Deploy with: cd contracts && npm run deploy:base
}

// Escrow contract ABI (key functions)
export const ESCROW_ABI = [
  {
    name: 'fundContestETH',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'contestId', type: 'bytes32' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'fundContestToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'contestId', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'selectWinner',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'contestId', type: 'bytes32' },
      { name: 'winner', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'refund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'cancelContest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'getContest',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: [
      { name: 'buyer', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'winner', type: 'address' },
    ],
  },
  {
    name: 'isContestActive',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'PLATFORM_FEE_BPS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// Helper to convert contest ID to bytes32
export function contestIdToBytes32(contestId: string): `0x${string}` {
  // UUID to bytes32: pad with zeros
  const hex = contestId.replace(/-/g, '')
  return `0x${hex.padEnd(64, '0')}` as `0x${string}`
}
