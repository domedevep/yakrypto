// crypto.ts
import crypto, {
  createSecretKey, generateKeyPairSync, createHash, createHmac,
  createCipheriv, createDecipheriv, type CipherKey, publicEncrypt, privateDecrypt
} from 'crypto';

export type SymmetricKey = Uint8Array;
export type Nonce = Uint8Array;
export type PublicKey = { visibility: 'public', type: 'encryption' | 'signing', key: string };
export type PrivateKey = { visibility: 'private', type: 'encryption' | 'signing', key: string };

export interface DatagramMetadata {
  type: string;
  version: string;
}

export interface EncryptionPublicKey {
  visibility: 'public';
  type: 'encryption';
  key: string;
  subtype?: string;
}

export interface EncryptionPrivateKey {
  visibility: 'private';
  type: 'encryption';
  key: string;
  subtype?: string;
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
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;
  private static readonly AUTH_TAG_LENGTH = 16;

  static encryptSymmetric<T, M extends DatagramMetadata>(
    data: T,
    codec: DatagramCodec<T, M>,
    key: SymmetricKey
  ): EncryptedDatagram<T, M> {
    const serialized = codec.serialize(data);
    const iv = new Uint8Array(crypto.randomBytes(this.IV_LENGTH));  // Using Uint8Array directly

    // Ensure `key` is in the correct format (BinaryLike) by using createSecretKey.
    const cipher = createCipheriv(this.ALGORITHM, createSecretKey(key), iv);
    const serializedData = Buffer.isBuffer(serialized) ? new Uint8Array(serialized) : serialized;

    // Convert `serialized` to `Uint8Array` to avoid Buffer issues
    const encryptedBuffer = Buffer.concat([
      new Uint8Array(cipher.update(serializedData)),
      new Uint8Array(cipher.final())
    ]);
    const authTag = cipher.getAuthTag();

    const fullMessage = new Uint8Array(iv.length + encryptedBuffer.length + authTag.length);
    fullMessage.set(iv, 0);
    fullMessage.set(encryptedBuffer, iv.length);
    fullMessage.set(authTag, iv.length + encryptedBuffer.length);

    return {
      payload: Buffer.from(fullMessage).toString('base64'),
      metadata: codec.metadata
    };
  }

  static decryptSymmetric<T, M extends DatagramMetadata>(
    encrypted: EncryptedDatagram<T, M>,
    codec: DatagramCodec<T, M>,
    key: SymmetricKey
  ): T {
    // Validate codec metadata
    if (encrypted.metadata.type !== codec.metadata.type || 
        encrypted.metadata.version !== codec.metadata.version) {
      throw new Error('Incompatible codec metadata for decryption');
    }
  
    const fullMessage = new Uint8Array(Buffer.from(encrypted.payload, 'base64'));
    const iv = fullMessage.subarray(0, this.IV_LENGTH);
    const authTag = fullMessage.subarray(-this.AUTH_TAG_LENGTH);
    const data = fullMessage.subarray(this.IV_LENGTH, -this.AUTH_TAG_LENGTH);
  
    const decipher = createDecipheriv(this.ALGORITHM, createSecretKey(key), iv);
    decipher.setAuthTag(authTag);
  
    const decryptedBuffer = Buffer.concat([
      new Uint8Array(decipher.update(data)),
      new Uint8Array(decipher.final())
    ]);
  
    return codec.deserialize(new Uint8Array(decryptedBuffer));
  }
  
  static encryptAsymmetric<T, M extends DatagramMetadata>(
    data: T,
    codec: DatagramCodec<T, M>,
    publicKey: string
  ): EncryptedDatagram<T, M> {
    const key = new Uint8Array(crypto.randomBytes(32));
    const encrypted = this.encryptSymmetric(data, codec, key);
    const encryptedKey = publicEncrypt(publicKey, new Uint8Array(Buffer.from(key)));

    return {
      payload: `${encryptedKey.toString('base64')}.${encrypted.payload}`,
      metadata: codec.metadata
    };
  }

  static decryptAsymmetric<T, M extends DatagramMetadata>(
    encrypted: EncryptedDatagram<T, M>,
    codec: DatagramCodec<T, M>,
    privateKey: string
  ): T {
    const [encryptedKey, payload] = encrypted.payload.split('.');
    const keyBuffer = privateDecrypt(privateKey, new Uint8Array(Buffer.from(encryptedKey, 'base64')));
    const key = new Uint8Array(keyBuffer);

    return this.decryptSymmetric(
      { payload, metadata: encrypted.metadata },
      codec,
      key
    );
  }

  static encryptAsymmetricFrontend<T, M extends DatagramMetadata>(
    data: T,
    codec: DatagramCodec<T, M>,
    publicKey: string
  ): EncryptedDatagram<T, M> {
    const key = new Uint8Array((32));
    const encrypted = this.encryptSymmetric(data, codec, key);
    const encryptedKey = publicEncrypt(publicKey, new Uint8Array(Buffer.from(key)));

    return {
      payload: `${encryptedKey.toString('base64')}.${encrypted.payload}`,
      metadata: codec.metadata
    };
  }

}



export function generateSymmetricKey(): SymmetricKey {
  return new Uint8Array(crypto.randomBytes(32));
}

export function generateKeyPair(): {
  publicKey: EncryptionPublicKey,
  privateKey: EncryptionPrivateKey
} {
  const keys = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return {
    publicKey: {
      visibility: 'public',
      type: 'encryption',
      key: keys.publicKey
    },
    privateKey: {
      visibility: 'private',
      type: 'encryption',
      key: keys.privateKey
    }
  };
}

export function generateSigningKeyPair(): {
  publicKey: PublicKey;
  privateKey: PrivateKey;
} {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    publicKey: {
      visibility: 'public',
      type: 'signing', // Specify the type correctly
      key: publicKey,
    },
    privateKey: {
      visibility: 'private',
      type: 'signing', // Specify the type correctly
      key: privateKey,
    },
  };
}

export function generateEncryptionKeyPair(): {
  publicKey: EncryptionPublicKey;
  privateKey: EncryptionPrivateKey;
} {
  const keys = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    publicKey: {
      visibility: 'public',
      type: 'encryption', // Ensure this matches the required type
      key: keys.publicKey,
    },
    privateKey: {
      visibility: 'private',
      type: 'encryption', // Ensure this matches the required type
      key: keys.privateKey,
    },
  };
}
