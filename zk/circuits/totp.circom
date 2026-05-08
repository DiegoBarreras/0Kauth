pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template TOTP() {
    // Entradas privadas
    signal input secreto;

    // Entradas públicas
    signal input timestamp;
    signal input codigo;
    signal input ventana;

    // Verificamos que ventana * 30 <= timestamp
    component lte = LessEqThan(64);
    lte.in[0] <== ventana * 30;
    lte.in[1] <== timestamp;
    lte.out === 1;

    // Calcula el hash con Poseidon
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secreto;
    hasher.inputs[1] <== ventana;

    // Verifica que el codigo coincide
    codigo === hasher.out;
}

component main {public [timestamp, codigo, ventana]} = TOTP();