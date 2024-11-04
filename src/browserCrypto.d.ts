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
  }