import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';

export async function generarPruebaZK(secreto, challenge) {
  const poseidon = await buildPoseidon();

  const secretoBig = BigInt(secreto);
  const challengeBig = BigInt(challenge);

  const hash = poseidon([secretoBig, challengeBig]);
  const hashStr = poseidon.F.toString(hash);

  const input = {
    secreto: secretoBig.toString(),
    challenge: challengeBig.toString(),
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    '/zk/totp.wasm',
    '/zk/totp_final.zkey'
  );

  return { proof, publicSignals, hash: hashStr };
}