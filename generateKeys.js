"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./src/index");
// Function to generate server keys and encrypt data
function generateServerKeys() {
    // Generate encryption key pair for Alice
    var alice = (0, index_1.generateEncryptionKeyPair)();
    // Example data to encrypt
    var testObject = {
        name: 'Alice',
        age: 25,
        gender: 'F',
        birthday: new Date(),
        gigantor: BigInt('12345678901234567890'),
    };
    // Define metadata for the data type
    var testMetadata = { type: 'datagram://json/test', version: '0.1.0' };
    // Create a codec for the defined type
    var testCodec = (0, index_1.createJsonDatagramCodec)(testMetadata);
    // Seal the data using Alice's public key
    var sealedbox = index_1.AEAD.seal(testObject, testCodec, alice.encryptionPublicKey);
    // Prepare the keys for storage
    var keys = {
        ALICE_PUBLIC_KEY: alice.encryptionPublicKey,
        ALICE_PRIVATE_KEY: alice.encryptionPrivateKey,
        SEALED_DATA: sealedbox,
    };
    // Store the keys and sealed data in a .env file
    var keysString = JSON.stringify(keys).replace(/"/g, '\\"');
    //   fs.appendFileSync('.env', `\nCRYPTO_KEYS="${keysString}"\n`);
    console.log('Keys have been generated and sealed data added to .env file', { keysString: keysString });
}
// Function to unseal the data
function unsealData(sealedData, privateKey) {
    // Define metadata for the data type (must match original)
    var testMetadata = { type: 'datagram://json/test', version: '0.1.0' };
    // Create the codec again to unseal the data
    var testCodec = (0, index_1.createJsonDatagramCodec)(testMetadata);
    // Unseal the data using Alice's private key
    var unsealedData = index_1.AEAD.unseal(sealedData, testCodec, privateKey);
    return unsealedData;
}
// Execute the key generation and data sealing
generateServerKeys();
// Example of unsealing the data later
// You would load these values from the .env file in practice
var keysFromEnv = process.env.CRYPTO_KEYS ? JSON.parse(process.env.CRYPTO_KEYS) : {};
var unsealedData = unsealData(keysFromEnv.SEALED_DATA, keysFromEnv.ALICE_PRIVATE_KEY);
console.log('Unsealed Data:', unsealedData);
