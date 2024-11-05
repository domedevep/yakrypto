// crypto-utils.js

// Import `browser-crypto` for backend or fallback to `window.browserCrypto` in the frontend
let cryptoModule;
if (typeof window === 'undefined') {
    // Backend: Use `@ravshansbox/browser-crypto`
    cryptoModule = require('@ravshansbox/browser-crypto');
} else {
    // Frontend: Use `window.browserCrypto`
    cryptoModule = window.Crypto;
}

// Destructure crypto functions
const { Buffer, createECDH, createCipheriv, createDecipheriv, pbkdf2, pbkdf2Sync } = cryptoModule;

// Generate ECDH key pairs and shared secrets
export const generateKeys = () => {
    const ecdh = createECDH('secp256k1');
    const publicKey = ecdh.generateKeys();
    console.log('Public Key:', publicKey.toString('hex'));
    return { ecdh, publicKey };
};

// Encrypt/Decrypt data
export const crypto2Function = (data:any, key:any, mode:any) => {
    // Create two ECDH instances for demonstration
    const ecdh1 = createECDH('secp256k1');
    const ecdh2 = createECDH('secp256k1');

    // Generate public keys
    const publicKey1 = ecdh1.generateKeys();
    const publicKey2 = ecdh2.generateKeys();

    // Compute shared secrets
    const secret1 = ecdh1.computeSecret(publicKey2);
    const secret2 = ecdh2.computeSecret(publicKey1);

    // Initialize IV for AES-GCM
    const iv = Buffer.alloc(16);
    const modifiedData = Buffer.from(data);

    // Encrypt data with AES-256-GCM
    const cipher = createCipheriv('aes-256-gcm', secret1.slice(0, 32), iv);
    const encrypted = Buffer.concat([cipher.update(modifiedData), cipher.final()]);
    console.log('Encrypted Data:', encrypted.toString('hex'));

    // Decrypt data
    const decipher = createDecipheriv('aes-256-gcm', secret2.slice(0, 32), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    console.log('Decrypted Data:', decrypted.toString());

    // Key derivation with pbkdf2 (async and sync)
    pbkdf2('password', 'salt', 1, 32, 'sha512', (error:any, derivedKey:any) => {
        if (error) throw error;
        console.log('Asynchronously Derived Key:', derivedKey.toString('hex'));
    });

    const derivedKey = pbkdf2Sync('password', 'salt', 1, 32, 'sha512');
    console.log('Synchronously Derived Key:', derivedKey.toString('hex'));

    return { encrypted, decrypted, derivedKey };
};
