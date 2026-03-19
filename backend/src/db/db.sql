CREATE DATABASE 0kauth;
USE 0kauth;

CREATE TABLE usuarios (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    pw_hash       VARCHAR(255) NOT NULL
);

CREATE TABLE cuentas_almacenadas (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    nom_servicio VARCHAR(100) NOT NULL,
    nom_cuenta VARCHAR(100) NOT NULL,
    totp_secreto  VARCHAR(100) NOT NULL,
    totp_algoritmo VARCHAR(10) NOT NULL DEFAULT 'SHA1',
    totp_digitos  TINYINT      NOT NULL DEFAULT 6,
    totp_frecuencia  TINYINT      NOT NULL DEFAULT 30,
    hora_creacion  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);