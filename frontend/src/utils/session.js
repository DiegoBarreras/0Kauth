// Guarda la llave en memoria — nunca en localStorage
let llaveEnMemoria = null

export function guardarLlave(llave) {
  llaveEnMemoria = llave
}

export function obtenerLlave() {
  return llaveEnMemoria
}

export function limpiarLlave() {
  llaveEnMemoria = null
}