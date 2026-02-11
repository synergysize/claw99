// Deployed contract address on Base mainnet
export const ESCROW_ADDRESS = '0x8305ef5c26a5c47cbe152ad2c483462de815199c' as const

// Base mainnet chain ID
export const BASE_CHAIN_ID = 8453

// USDC on Base
export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const

// Contract ABI (only the functions we need)
export const ESCROW_ABI = [
  {
    name: 'fundContestETH',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'contestId', type: 'bytes32' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'fundContestToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'contestId', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'selectWinner',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'contestId', type: 'bytes32' },
      { name: 'winner', type: 'address' }
    ],
    outputs: []
  },
  {
    name: 'refund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: []
  },
  {
    name: 'cancelContest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: []
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
      { name: 'winner', type: 'address' }
    ]
  },
  {
    name: 'isContestActive',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'contestId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'PLATFORM_FEE_BPS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

// Convert UUID to bytes32 for contract
export function uuidToBytes32(uuid: string): `0x${string}` {
  // Remove dashes and pad to 32 bytes
  const hex = uuid.replace(/-/g, '')
  return `0x${hex.padEnd(64, '0')}` as `0x${string}`
}

// Calculate total with platform fee (5%)
export function calculateTotalWithFee(amount: number): number {
  return amount * 1.05
}
