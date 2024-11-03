import { generateEncryptionKeyPair, AEAD, createJsonDatagramCodec } from './src/index';

// Function to generate server keys and encrypt data
function generateServerKeys() {
  // Generate encryption key pair for Alice
  const alice = generateEncryptionKeyPair();

  // Example data to encrypt
  const testObject = {
    name: 'Alice',
    age: 25,
    gender: 'F',
    birthday: new Date(),
    gigantor: BigInt('12345678901234567890'),
  };

  // Define metadata for the data type

  const testMetadata = { type: 'datagram://json/test', version: '0.1.0' };

  // Create a codec for the defined type
  const testCodec = createJsonDatagramCodec(testMetadata);

  // Seal the data using Alice's public key
  const sealedbox = AEAD.seal(testObject, testCodec, alice.encryptionPublicKey);

  // Prepare the keys for storage
  const keys = {
    ALICE_PUBLIC_KEY: alice.encryptionPublicKey,
    ALICE_PRIVATE_KEY: alice.encryptionPrivateKey,
    SEALED_DATA: sealedbox,
  };

  // Store the keys and sealed data in a .env file
  const keysString = JSON.stringify(keys).replace(/"/g, '\\"');
  //   fs.appendFileSync('.env', `\nCRYPTO_KEYS="${keysString}"\n`);

  console.log('Keys have been generated and sealed data added to .env file', { keysString });
}

// Function to unseal the data
function unsealData(sealedData, privateKey) {
  // Define metadata for the data type (must match original)
  const testMetadata = { type: 'datagram://json/test', version: '0.1.0' };

  // Create the codec again to unseal the data
  const testCodec = createJsonDatagramCodec(testMetadata);

  // Unseal the data using Alice's private key
  const unsealedData = AEAD.unseal(sealedData, testCodec, privateKey);
  return unsealedData;
}

// Execute the key generation and data sealing
generateServerKeys();

// Example of unsealing the data later
// You would load these values from the .env file in practice
const keysFromEnv = process.env.CRYPTO_KEYS ? JSON.parse(process.env.CRYPTO_KEYS) : {};
const unsealedData = unsealData(keysFromEnv.SEALED_DATA, keysFromEnv.ALICE_PRIVATE_KEY);
console.log('Unsealed Data:', unsealedData);
