import { buildPoseidon } from "circomlibjs";

const poseidon = await buildPoseidon();

const secreto = 12345n;
const timestamp = BigInt(Math.floor(Date.now() / 1000));
const ventana = timestamp / 30n;

const hash = poseidon([secreto, ventana]);
const codigo = poseidon.F.toString(hash);

console.log({
  secreto: secreto.toString(),
  timestamp: timestamp.toString(),
  ventana: ventana.toString(),
  codigo
});