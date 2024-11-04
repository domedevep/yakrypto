// import { generateEncryptionKeyPair, AEAD } from './src/crypto';
// import { createJsonDatagramCodec } from './src/codec'; // Assuming createJsonDatagramCodec is defined in this module

// // Function to generate server keys and encrypt data
// function generateServerKeys() {
//   console.log('Generating encryption key pair for Alice...');
  
//   // Generate encryption key pair for Alice
//   const alice = generateEncryptionKeyPair();
//   console.log('Alice\'s Key Pair:', alice);

//   // Example data to encrypt
//   const testObject = {
//     name: 'Alice',
//     age: 25,
//     gender: 'F',
//     birthday: new Date().toISOString(), // Storing date as a string for JSON compatibility
//     gigantor: BigInt('12345678901234567890'),
//   };
//   console.log('Data to be sealed:', testObject);

//   // Define metadata for the data type
//   const testMetadata = { type: 'datagram://json/test', version: '0.1.0' };

//   // Create a codec for the defined type
//   const testCodec = createJsonDatagramCodec(testMetadata);

//   // Seal the data using Alice's public key
//   const sealedBox = AEAD.seal(testObject, testCodec, alice.encryptionPublicKey);
//   console.log('Sealed data:', sealedBox);

//   // Prepare the keys for storage
//   const keys = {
//     ALICE_PUBLIC_KEY: alice.encryptionPublicKey,
//     ALICE_PRIVATE_KEY: alice.encryptionPrivateKey,
//     SEALED_DATA: sealedBox,
//   };

//   // Store the keys in a .env file
//   const keysString = JSON.stringify(keys).replace(/"/g, '\\"');
//   // Uncomment the following line to write to the .env file
//   // fs.appendFileSync('.env', `\nCRYPTO_KEYS="${keysString}"\n`);

//   console.log('Keys have been generated and sealed data prepared for storage.', { keysString });
// }

// // Function to unseal the data
// function unsealData(sealedData, privateKey) {
//   console.log('Unsealing data...');
  
//   // Define metadata for the data type (must match original)
//   const testMetadata = { type: 'datagram://json/test', version: '0.1.0' };

//   // Create the codec again to unseal the data
//   const testCodec = createJsonDatagramCodec(testMetadata);

//   // Unseal the data using Alice's private key
//   const unsealedData = AEAD.unseal(sealedData, testCodec, privateKey);
//   console.log('Unsealed Data:', unsealedData);
  
//   return unsealedData;
// }

// // Execute the key generation and data sealing
// generateServerKeys();

// // Example of unsealing the data later
// // Simulated loading of keys from the .env file
// const keysFromEnv = process.env.CRYPTO_KEYS ? JSON.parse(process.env.CRYPTO_KEYS) : {};
// if (keysFromEnv.SEALED_DATA && keysFromEnv.ALICE_PRIVATE_KEY) {
//   console.log('Attempting to unseal the data...');
//   const unsealedData = unsealData(keysFromEnv.SEALED_DATA, keysFromEnv.ALICE_PRIVATE_KEY);
//   console.log('Final Unsealed Data:', unsealedData);
// } else {
//   console.error('Failed to load sealed data or private key from environment.');
// }
