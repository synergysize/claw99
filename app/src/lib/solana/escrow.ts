import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { CONNECTION, PLATFORM_WALLET, TOKENS } from './config'

/**
 * Send SOL to platform wallet for contest funding
 */
export async function fundContestSol(
  wallet: any,
  amountSol: number,
  memo?: string
): Promise<string> {
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL)

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: PLATFORM_WALLET,
      lamports,
    })
  )

  const signature = await wallet.sendTransaction(tx, CONNECTION)
  await CONNECTION.confirmTransaction(signature, 'confirmed')

  return signature
}

/**
 * Send SPL token to platform wallet for contest funding
 */
export async function fundContestToken(
  wallet: any,
  tokenMint: PublicKey,
  amount: number,
  decimals: number
): Promise<string> {
  const amountRaw = Math.floor(amount * Math.pow(10, decimals))

  const fromTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  )

  const toTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    PLATFORM_WALLET
  )

  const tx = new Transaction()

  // Check if platform token account exists
  const toAccountInfo = await CONNECTION.getAccountInfo(toTokenAccount)
  if (!toAccountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        toTokenAccount,
        PLATFORM_WALLET,
        tokenMint
      )
    )
  }

  tx.add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      wallet.publicKey,
      amountRaw
    )
  )

  const signature = await wallet.sendTransaction(tx, CONNECTION)
  await CONNECTION.confirmTransaction(signature, 'confirmed')

  return signature
}

/**
 * Get SOL balance
 */
export async function getSolBalance(pubkey: PublicKey): Promise<number> {
  const balance = await CONNECTION.getBalance(pubkey)
  return balance / LAMPORTS_PER_SOL
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  pubkey: PublicKey,
  tokenMint: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(tokenMint, pubkey)
    const accountInfo = await CONNECTION.getTokenAccountBalance(tokenAccount)
    return parseFloat(accountInfo.value.uiAmountString || '0')
  } catch {
    return 0
  }
}
