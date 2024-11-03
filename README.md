# Crypto Library

✅ Strongly typed
✅ Easy-to-use
✅ Battle tested encryption

This crypto library is built atop the tweetnacl library, providing typed primitives and a strongly typed API. It helps prevent common issues like accidentally posting client secret keys or mixing up signing and encryption keys.

The library defines the following primitives for cryptography:

```tsx
export type SymmetricKey = Uint8Array;
export type Nonce = Uint8Array;
export type PublicKey = { visibility: 'public', type: string, key: string };
export type PrivateKey = { visibility: 'private', type: string, key: string };

export interface KeyPair {
  public: PublicKey;
  private: PrivateKey;  
}

export interface EncryptionPublicKey extends PublicKey {
  type: 'encryption'
}

export interface EncryptionPrivateKey extends PrivateKey {
  type: 'encryption'
}

export interface SigningPublicKey extends PublicKey {
  type: 'signing'
}

export interface SigningPrivateKey extends PrivateKey {
  type: 'signing'
}
```

For typed encrypted data, we have these interfaces:

```tsx
export interface DatagramMetadata {
  type: string;
  version: string; // Semver
}

export interface DatagramCodec<T, M extends DatagramMetadata>{
  metadata: M;
  versionRange: Range;
  serialize(data: T): Uint8Array;
  deserialize(bytes: Uint8Array): T;
}

export interface EncryptedDatagram<T, M extends DatagramMetadata> {
  payload: string; // base64 encoded encrypted bytes.
  metadata: M;
};
```

The library provides ready-made codecs for primitive types and a helper to create codecs for JSON objects:

```tsx
export const createJsonDatagramCodec = <T, M extends DatagramMetadata(metadata: M, versionRange: Range = new Range('00.1.*'): DatagramCodec<T,M> => {...}
```

## Symmetric Encryption

```tsx
import { generateSymmetricKey, AEAD, EncryptedDatagram, StringDatagramCodec } from 'crypto-lib'

const data = 'Hello World!';
const key = generateSymmetricKey();
const cipher: EncryptedDatagram<string, StringDatagramMetadata> = AEAD.encryptSymmetric(data, StringDatagramCodec, symmetricKey);
assertEquals(data, AEAD.decryptSymmetric(ciphertext, StringDatagramCodec, symmetricKey));

// ❌ The following will throw a TypeError.
assertEquals(data, AEAD.decryptSymmetric(cipher, NumberDatagramCodec, key));
```

## Asymmetric Encryption - Seal/Unseal

Example with strongly typed JSON objects:

```tsx
import { generateEncryptionKeyPair, AEAD } from 'crypto-lib'

const alice = generateEncryptionKeyPair();
type TestType = {
  name: string,
  age: number,
  gender: 'M' | 'F' | 'N',
  birthday: Date,
  gigantor: BigInt
};
const testObject: TestType = {
  name: 'Alice',
  age: 25,
  gender: 'F',
  birthday: new Date(),
  gigantor: BigInt('12345678901234567890')
};
type TestMetadata = { type: 'datagram://json/test', version: '0.1.0'};
const testMetadata: TestMetadata = { type: 'datagram://json/test', version: '0.1.0'};
const testCodec = createJsonDatagramCodec<TestType, TestMetadata>(testMetadata);

const sealedbox = AEAD.seal(testObject, testCodec, alice.public);
const unsealedData = AEAD.unseal(sealedbox, testCodec, alice.private);
expect(unsealedData).toEqual(testObject);
```

## Diffie Hellman Key Exchange (DHKE)

```tsx
const alice = generateEncryptionKeyPair();
const aliceSign = generateSigningKeyPair();
const bob = generateEncryptionKeyPair();
const testString = 'This is a test message';
const encrypted = AEAD.encryptAsymmetric(testString, StringDatagramCodec, alice.private, bob.public, aliceSign.private);
const decrypted = AEAD.decryptAsymmetric(encrypted, StringDatagramCodec, bob.private, alice.public, aliceSign.public);
expect(testString).toEqual(decrypted);
```

Computing shared keys:
```tsx
export function computeSharedKey(theirPublicKey: EncryptionPublicKey, myPrivateKey: EncryptionPrivateKey): SymmetricKey
```

# Encrypted Permissions Protocol

A cryptographic protocol for authorizing access and user permissions using cryptographic keys and DHKE.

## Core Concepts

- **PermissionKeys**: Public/private key-pairs representing permissions
    - Granular: One key-pair per permission per resource
    ```tsx
    PermissionKey(VIEW,Doc1) ≠ PermissionKey(VIEW,Doc2) ≠ PermissionKey(EDIT,Doc1)
    ```
    - **PermissionPublicKey (PPK)**: Publicly accessible
    - **PermissionPrivateData (PPD)**: Private key and metadata
    - **PermissionSecretKey (PSK)**: Symmetric key used to encrypt PPD
    - Initially, only the creator has PSK access

## Permission Operations

### Granting Permissions

1. Authorized user A with PSK access can authorize user B by:
   - Encrypting PSK with B's public key
   - Creating Permission Grant Key (PGK)
   
2. User B can then:
   - Decrypt PGK using their private key
   - Access PSK and PPD

### Access Verification

Users prove authorization by:
```tsx
const permissionProof = asymmetricEncrypt(computeSharedKey(permissionPrivateKey,servicePublicKey),userPrivateKey)
```

Services verify access by:
```tsx
const sharedKeyFromProof = decryptAsymmetric(permissionProof, userPublicKey);
const computedSharedKey = computeSharedKey(servicePrivateKey, permissionPublicKey);
assertEquals(sharedKeyFromProof, computedSharedKey);
```

## Security Properties

- Proof requires only PSK access demonstration
- No sensitive data exposure to service/MITM
- Prevention of unauthorized access via database manipulation
- Protection against MITM/Replay attacks through unique PGKs

## Permission Revocation Methods

1. Key Rotation Method:
   - Rotate permission keys
   - Mint new grants for authorized users
   - O(n) operation with n users
   - Enables decentralized access checks

2. Grant Repository Method:
   - Maintain PGK records
   - Remove specific user's PGK
   - O(1) operation
   - Requires centralized verification

## API Reference

### Creating Permissions

```tsx
YEP.newPermission<Keys extends string, Name extends string>(
  name: Name,
  data: PermissionDataType<Keys>,
  creatorPublicKey: PublicKey
): {
  permission: Permission<Name>,
  keys: PermissionKeyPair<Name>,
  grant: PermissionGrant<Name>
};
```

Simple permission example:
```tsx
const { permission: viewPerm, keys: viewPermKeys, grant: viewGrant } = 
  YEP.newPermission('VIEW', {}, myKeys.public);
```

Complex permissions example:
```tsx
const {permission: viewPermission, keys: viewKeys, grant: viewGrant} = 
  YEP.newPermission('VIEW', {}, alice.public);
const {permission: commentPermission, keys: commentKeys, grant: commentGrant} = 
  YEP.newPermission('COMMENT', { 'VIEW': viewKeys.private }, alice.public);
const {permission: editPermission, keys: editKeys, grant: editGrant} = 
  YEP.newPermission('EDIT', 
    { 
      'VIEW': viewKeys.private, 
      'COMMENT': commentKeys.private 
    }, 
    alice.public);
```

### Granting Permissions

```tsx
YEP.createGrant<Name extends string>(
  myPrivateKey: EncryptionPrivateKey,
  myPermissionGrant: PermissionGrant<Name>,
  theirPublicKey: EncryptionPublicKey
) : PermissionGrant<Name>
```

### Creating Proofs

```tsx
YEP.createProof<Keys extends string, Name extends string>(
  permission: Permission<Keys, Name>,
  myPermissionGrant: PermissionGrant<Name>,
  myPrivateKey: EncryptionPrivateKey,
  mySigningKey: SigningPrivateKey,
  servicePublicKey: ServicePublicKey
): PermissionProof<Name>
```

For complex permissions:
```tsx
YEP.createProofFor<Keys extends string, Name extends string, ProofName extends Keys>(
  name: ProofName,
  permission: Permission<Keys, Name>,
  myPermissionGrant: PermissionGrant<Name>,
  myPrivateKey: EncryptionPrivateKey,
  mySigningKey: SigningPrivateKey,
  servicePublicKey: ServicePublicKey
): PermissionProof<ProofName>
```

### Verifying Proofs

```tsx
YEP.verifyProof<Name extends string>(
  permission: Permission<string,Name>,
  proof: PermissionProof<Name>,
  userPublicKey: EncryptionPublicKey,
  userSigningPublicKey: SigningPublicKey,
  servicePrivateKey: ServicePrivateKey
): boolean
```

This API set provides a complete framework for implementing cryptographic permission management with type safety and secure key handling.