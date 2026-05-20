import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';

function base32ToNumber(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = 0n
  for (const char of base32.toUpperCase().replace(/=+$/, '')) {
    const val = alphabet.indexOf(char)
    if (val === -1) continue
    result = result * 32n + BigInt(val)
  }
  return result
}

export async function generarPruebaZK(secreto, challenge) {
  const poseidon = await buildPoseidon()

  const secretoBig = base32ToNumber(secreto)
  const challengeBig = BigInt(challenge)

  const input = {
    secreto: secretoBig.toString(),
    challenge: challengeBig.toString(),
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    '/zk/totp.wasm',
    '/zk/totp_final.zkey'
  )

  return { proof, publicSignals }
}