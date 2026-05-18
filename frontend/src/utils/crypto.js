// Deriva una llave AES-256 desde la contraseña del usuario
export async function derivarLlave(password, salt) {
  const encoder = new TextEncoder()
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Cifra el secreto TOTP
export async function cifrarSecreto(secreto, llave) {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    llave,
    encoder.encode(secreto)
  )

  return {
    secretoCifrado: btoa(String.fromCharCode(...new Uint8Array(cifrado))),
    iv: btoa(String.fromCharCode(...iv))
  }
}

// Descifra el secreto TOTP
export async function descifrarSecreto(secretoCifrado, iv, llave) {
  const cifradoBytes = Uint8Array.from(atob(secretoCifrado), c => c.charCodeAt(0))
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0))

  const descifrado = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    llave,
    cifradoBytes
  )

  return new TextDecoder().decode(descifrado)
}

// Genera un salt aleatorio
export function generarSalt() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
}