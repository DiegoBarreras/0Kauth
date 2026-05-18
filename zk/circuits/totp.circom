pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template TOTP() {
    // Entrada privada — solo la conoce el usuario
    signal input secreto;

    // Entradas públicas — las ve el servidor
    signal input challenge;
    signal output hash;

    // Calcula Poseidon(secreto, challenge)
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secreto;
    hasher.inputs[1] <== challenge;

    hash <== hasher.out;
}

component main {public [challenge]} = TOTP();