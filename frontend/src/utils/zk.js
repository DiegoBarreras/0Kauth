import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';

export async function generarPruebaZK(secreto, timestamp) {
  const poseidon = await buildPoseidon();

  const ts = BigInt(timestamp);
  const ventana = ts / 30n;
  const secretoBig = BigInt(secreto);

  const hash = poseidon([secretoBig, ventana]);
  const codigo = poseidon.F.toString(hash);

  const input = {
    secreto: secretoBig.toString(),
    timestamp: ts.toString(),
    ventana: ventana.toString(),
    codigo,
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    '/zk/totp.wasm',
    '/zk/totp_final.zkey'
  );

  return { proof, publicSignals };
}