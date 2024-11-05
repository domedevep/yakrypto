// crypto.ts
import * as CryptoJS from 'crypto-js';
import * as forge from 'node-forge';
import {Buffer} from 'buffer';

export type SymmetricKey = Uint8Array;
export type Nonce = Uint8Array;
export type PublicKey = { visibility: 'public', type: 'encryption' | 'signing', key: string };
export type PrivateKey = { visibility: 'private', type: 'encryption' | 'signing', key: string };

export interface DatagramMetadata {
  type: string;
  version: string;
}

export interface EncryptedDatagram<T, M extends DatagramMetadata> {
  payload: string;
  metadata: M;
}

export interface DatagramCodec<T, M extends DatagramMetadata> {
  metadata: M;
  versionRange: string;
  serialize(data: T): Uint8Array;
  deserialize(bytes: Uint8Array): T;
}

export class AEAD {
  private static readonly ALGORITHM = 'AES';
  private static readonly IV_LENGTH = 16; // AES block size in bytes

  static encryptSymmetric<T, M extends DatagramMetadata>(
    data: T,
    codec: DatagramCodec<T, M>,
    key: SymmetricKey
  ): EncryptedDatagram<T, M> {
    const serialized = codec.serialize(data);
    const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);

    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(serialized),
      CryptoJS.lib.WordArray.create(key),
      { iv }
    );

    return {
      payload: iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64),
      metadata: codec.metadata
    };
  }
  static decryptSymmetric<T, M extends DatagramMetadata>(
    encrypted: EncryptedDatagram<T, M>,
    codec: DatagramCodec<T, M>,
    key: SymmetricKey
  ): T {
    const fullMessage = CryptoJS.enc.Base64.parse(encrypted.payload);
  
    // Extract IV (first 16 bytes, AES block size)
    const ivWords = fullMessage.words.slice(0, this.IV_LENGTH / 4);
    const ciphertextWords = fullMessage.words.slice(this.IV_LENGTH / 4);
    const iv = CryptoJS.lib.WordArray.create(ivWords);
    const ciphertext = CryptoJS.lib.WordArray.create(ciphertextWords);
  
    // Create CipherParams object for decryption
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
  
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.lib.WordArray.create(key), { iv });
  
    // Convert decrypted result to Uint8Array and deserialize
    const decryptedBytes = new Uint8Array(decrypted.words.length * 4);
    for (let i = 0; i < decrypted.words.length; i++) {
      decryptedBytes[i * 4] = (decrypted.words[i] >> 24) & 0xff;
      decryptedBytes[i * 4 + 1] = (decrypted.words[i] >> 16) & 0xff;
      decryptedBytes[i * 4 + 2] = (decrypted.words[i] >> 8) & 0xff;
      decryptedBytes[i * 4 + 3] = decrypted.words[i] & 0xff;
    }
  
    // Deserialize and remove any trailing non-printable characters if T is a string
    let decryptedData = codec.deserialize(decryptedBytes);
  
    if (typeof decryptedData === 'string') {
      // Trim all non-printable ASCII characters, which may be padding
      decryptedData = decryptedData.replace(/[\x00-\x1F]+$/g, '') as T;
    }
  
    return decryptedData;
  }
  
  
  
  static encryptAsymmetric<T, M extends DatagramMetadata>(
    data: T,
    codec: DatagramCodec<T, M>,
    publicKey: string
  ): EncryptedDatagram<T, M> {
    const key = forge.random.getBytesSync(32);
    const encrypted = this.encryptSymmetric(data, codec, new Uint8Array(Buffer.from(key, 'binary')));
    
    // Encrypt the symmetric key with the public key
    const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);
    const encryptedKey = forgePublicKey.encrypt(key);

    return {
      payload: `${forge.util.encode64(encryptedKey)}.${encrypted.payload}`,
      metadata: codec.metadata
    };
  }

  static decryptAsymmetric<T, M extends DatagramMetadata>(
    encrypted: EncryptedDatagram<T, M>,
    codec: DatagramCodec<T, M>,
    privateKey: string
  ): T {
    const [encryptedKey, payload] = encrypted.payload.split('.');
    const forgePrivateKey = forge.pki.privateKeyFromPem(privateKey);
    const key = forgePrivateKey.decrypt(forge.util.decode64(encryptedKey));

    return this.decryptSymmetric(
      { payload, metadata: encrypted.metadata },
      codec,
      new Uint8Array(Buffer.from(key, 'binary'))
    );
  }
}

export function generateSymmetricKey(): SymmetricKey {
    // Generate 32 bytes of random data (not words)
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    const keyArray = new Uint8Array(randomBytes.words.length * 4);
    
    for (let i = 0; i < randomBytes.words.length; i++) {
      keyArray[i * 4] = (randomBytes.words[i] >> 24) & 0xff;
      keyArray[i * 4 + 1] = (randomBytes.words[i] >> 16) & 0xff;
      keyArray[i * 4 + 2] = (randomBytes.words[i] >> 8) & 0xff;
      keyArray[i * 4 + 3] = randomBytes.words[i] & 0xff;
    }
  
    return keyArray.slice(0, 32);  // Truncate to ensure exactly 32 bytes
  }
  

export function generateKeyPair(): {
  publicKey: PublicKey,
  privateKey: PrivateKey
} {
  const keypair = forge.pki.rsa.generateKeyPair(2048);
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

  return {
    publicKey: {
      visibility: 'public',
      type: 'encryption',
      key: publicKey
    },
    privateKey: {
      visibility: 'private',
      type: 'encryption',
      key: privateKey
    }
  };
}

export function generateSigningKeyPair(): {
  publicKey: PublicKey;
  privateKey: PrivateKey;
} {
  const { publicKey: encryptionPublicKey, privateKey: encryptionPrivateKey } = generateKeyPair();

  return {
    publicKey: {
      visibility: 'public',
      type: 'signing',
      key: encryptionPublicKey.key,
    },
    privateKey: {
      visibility: 'private',
      type: 'signing',
      key: encryptionPrivateKey.key,
    },
  };
}
