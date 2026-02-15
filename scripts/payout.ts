/**
 * Payout script for sending SOL/tokens to contest winners
 * Run from backend/serverless function
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token'
import bs58 from 'bs58'

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'
const CONNECTION = new Connection(RPC_ENDPOINT, 'confirmed')

// Load platform wallet from env
function getPlatformWallet(): Keypair {
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY
  if (!privateKey) throw new Error('PLATFORM_WALLET_PRIVATE_KEY not set')
  return Keypair.fromSecretKey(bs58.decode(privateKey))
}

/**
 * Send SOL payout to winner
 */
export async function payoutSol(
  winnerPubkey: string,
  amountSol: number
): Promise<string> {
  const platformWallet = getPlatformWallet()
  const winner = new PublicKey(winnerPubkey)
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL)

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: platformWallet.publicKey,
      toPubkey: winner,
      lamports,
    })
  )

  const signature = await sendAndConfirmTransaction(CONNECTION, tx, [
    platformWallet,
  ])

  console.log(`Sent ${amountSol} SOL to ${winnerPubkey}`)
  console.log(`Signature: ${signature}`)

  return signature
}

/**
 * Send SPL token payout to winner
 */
export async function payoutToken(
  winnerPubkey: string,
  tokenMint: string,
  amount: number,
  decimals: number
): Promise<string> {
  const platformWallet = getPlatformWallet()
  const winner = new PublicKey(winnerPubkey)
  const mint = new PublicKey(tokenMint)
  const amountRaw = Math.floor(amount * Math.pow(10, decimals))

  const fromTokenAccount = await getAssociatedTokenAddress(
    mint,
    platformWallet.publicKey
  )

  const toTokenAccount = await getAssociatedTokenAddress(mint, winner)

  const tx = new Transaction()

  // Create winner's token account if needed
  const toAccountInfo = await CONNECTION.getAccountInfo(toTokenAccount)
  if (!toAccountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        platformWallet.publicKey,
        toTokenAccount,
        winner,
        mint
      )
    )
  }

  tx.add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      platformWallet.publicKey,
      amountRaw
    )
  )

  const signature = await sendAndConfirmTransaction(CONNECTION, tx, [
    platformWallet,
  ])

  console.log(`Sent ${amount} tokens to ${winnerPubkey}`)
  console.log(`Signature: ${signature}`)

  return signature
}

// CLI usage
if (process.argv[2] === 'sol') {
  const winner = process.argv[3]
  const amount = parseFloat(process.argv[4])
  payoutSol(winner, amount).catch(console.error)
} else if (process.argv[2] === 'token') {
  const winner = process.argv[3]
  const mint = process.argv[4]
  const amount = parseFloat(process.argv[5])
  const decimals = parseInt(process.argv[6] || '6')
  payoutToken(winner, mint, amount, decimals).catch(console.error)
}
