// browserCrypto.d.ts

declare module 'browser-crypto' {
    export function createCipheriv(algorithm: string, key: Uint8Array, iv: Uint8Array): Cipher;
    export function createDecipheriv(algorithm: string, key: Uint8Array, iv: Uint8Array): Decipher;
  
    export interface Cipher {
      update(data: Uint8Array): Uint8Array;
      final(): Uint8Array;
      getAuthTag(): Uint8Array;
      setAAD(aad: Uint8Array): this;
      createCipheriv(algorithm: string, key: Uint8Array, iv: Uint8Array): Cipher;
    }
  
    export interface Decipher {
      update(data: Uint8Array): Uint8Array;
      final(): Uint8Array;
      setAuthTag(tag: Uint8Array): this;
      setAAD(aad: Uint8Array): this;
    }

    export function createECDH(curveName: string): ECDH;
    export interface ECDH {
      generateKeys(): Uint8Array;
      computeSecret(publicKey: Uint8Array): Uint8Array;
    }

    export function pbkdf2(password: string, salt: string, iterations: number, keylen: number, digest: string, callback: (error: Error | null, derivedKey: Uint8Array) => void): void;

    export function pbkdf2Sync(password: string, salt: string, iterations: number, keylen: number, digest: string): Uint8Array;

    export const Buffer: {
      from(data: string): Uint8Array;
      alloc(size: number): Uint8Array;
      concat(buffers: Uint8Array[]): Uint8Array
    }

    export function randomBytes(size: number): Uint8Array;
  }