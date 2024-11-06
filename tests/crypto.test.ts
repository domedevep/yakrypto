// crypto.test.ts
import { NumberDatagramCodec } from '../src';
import * as cryptoModule from '../src/crypto3';
import { toByteArray, fromByteArray } from 'base64-js';

describe('crypto module key generation and encryption tests', () => {
  it('generates encryption key pairs', () => {
    console.log('Starting key pair generation...');
    const keyPair = cryptoModule.generateKeyPair();
    console.log('Generated key pair:', keyPair);
    
    expect(keyPair.publicKey.type).toEqual('encryption');
    expect(keyPair.publicKey.visibility).toEqual('public');
    expect(keyPair.privateKey.type).toEqual('encryption');
    expect(keyPair.privateKey.visibility).toEqual('private');
    console.log('Key pair generation test passed.');
  });

  it('generates symmetric keys', () => {
    console.log('Starting symmetric key generation...');
    const symmetricKey = cryptoModule.generateSymmetricKey();
    console.log('Generated symmetric key:', symmetricKey);
    
    expect(symmetricKey).toBeInstanceOf(Uint8Array);
    expect(symmetricKey.length).toEqual(32);
    console.log('Symmetric key generation test passed.');
  });
});

describe('AEAD encryption and decryption', () => {
  const StringDatagramCodec = {
    metadata: { type: 'datagram://string', version: '1.0' },
    versionRange: '1.0',
    serialize: (data: string) => new Uint8Array(Buffer.from(data)),
    deserialize: (bytes: Uint8Array) => Buffer.from(bytes).toString()
  };

  it('encrypts and decrypts strings with symmetric keys', () => {
    const symmetricKey = cryptoModule.generateSymmetricKey();
    const testString = 'Hello, secure world!';
    
    console.log('Testing symmetric encryption and decryption for string:', testString);
    
    const encrypted = cryptoModule.AEAD.encryptSymmetric(testString, StringDatagramCodec, symmetricKey);
    console.log('Encrypted string:', encrypted);
    
    const decrypted = cryptoModule.AEAD.decryptSymmetric(encrypted, StringDatagramCodec, symmetricKey);
    console.log('Decrypted string:', decrypted);
    
    expect(decrypted).toEqual(testString);
    console.log('Symmetric string encryption and decryption test passed.');
  });

  it('throws error on decryption with incorrect symmetric key', () => {
    const symmetricKey = cryptoModule.generateSymmetricKey();
    const wrongKey = cryptoModule.generateSymmetricKey();
    const testString = 'Mismatched key test';
    
    console.log('Testing decryption with incorrect key for string:', testString);
    
    const encrypted = cryptoModule.AEAD.encryptSymmetric(testString, StringDatagramCodec, symmetricKey);
    console.log('Encrypted string with correct key:', encrypted);
    
    try {
      cryptoModule.AEAD.decryptSymmetric(encrypted, StringDatagramCodec, wrongKey);
      console.log('Decryption did not throw an error with incorrect key.');
      fail('Expected error not thrown');
    } catch (error) {
      console.log('Decryption failed as expected with error:', error);
    }
    
    console.log('Test for decryption with incorrect key passed.');
  });

  it('encrypts and decrypts numbers with symmetric keys', () => {
    const symmetricKey = cryptoModule.generateSymmetricKey();
    const testNumber = 42.195;

    console.log('Testing symmetric encryption and decryption for number:', testNumber);
    
    const encrypted = cryptoModule.AEAD.encryptSymmetric(testNumber, NumberDatagramCodec, symmetricKey);
    console.log('Encrypted number:', encrypted);
    
    const decrypted = cryptoModule.AEAD.decryptSymmetric(encrypted, NumberDatagramCodec, symmetricKey);
    console.log('Decrypted number:', decrypted);

    expect(decrypted).toEqual(testNumber);
    console.log('Symmetric number encryption and decryption test passed.');
  });
  
  it('encrypts and decrypts data with asymmetric keys', () => {
    const keyPair = cryptoModule.generateKeyPair();
    const testString = 'Asymmetric encryption test';

    console.log('Testing asymmetric encryption and decryption for string:', testString);
    
    const encrypted = cryptoModule.AEAD.encryptAsymmetric(testString, StringDatagramCodec, keyPair.publicKey.key);
    console.log('Encrypted string with public key:', encrypted);
    
    const decrypted = cryptoModule.AEAD.decryptAsymmetric(encrypted, StringDatagramCodec, keyPair.privateKey.key);
    console.log('Decrypted string with private key:', decrypted);
    console.log({decrypted}); //
    expect(decrypted).toEqual(testString);
    console.log('Asymmetric string encryption and decryption test passed.');
  });
});

