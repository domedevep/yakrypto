// import { generateEncryptionKeyPair, generateSigningKeyPair } from "../src/crypto"; // Make sure to import the correct functions
// import { YEP } from "../src/yep";

// // Define the interface for the key pair
// interface KeyPair {
//   publicKey: string;  // Adjust the type based on your actual key type
//   privateKey: string; // Adjust the type based on your actual key type
// }

// describe('Test YEP permissions', () => {
//   let aliceEncrypt: KeyPair, aliceSign: KeyPair, service: KeyPair; // Explicitly type the variables
//   beforeEach(() => {
//     aliceEncrypt = generateEncryptionKeyPair();
//     aliceSign = generateSigningKeyPair();
//     service = generateEncryptionKeyPair(); // Use an encryption key pair for service
//   });

//   it('creates a new basic permission and verifies proof successfully', async () => {
//     const { permission, grant } = YEP.newPermission('VIEW', {}, aliceEncrypt.publicKey);
//     const proof = YEP.createProof(permission, grant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const verification = YEP.verifyProof(permission, proof, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);

//     expect(verification).toBe(true);
//   });

//   it('creates and verifies complex permissions', async () => {
//     const { permission: viewPermission, grant: viewGrant } = YEP.newPermission('VIEW', {}, aliceEncrypt.publicKey);
//     const { permission: editPermission, grant: editGrant } = YEP.newPermission('EDIT', { 'VIEW': viewGrant.grantKey }, aliceEncrypt.publicKey);

//     const editProof = YEP.createProof(editPermission, editGrant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const editVerification = YEP.verifyProof(editPermission, editProof, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(editVerification).toBe(true);

//     const viewProof = YEP.createProof(viewPermission, viewGrant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const viewVerification = YEP.verifyProof(viewPermission, viewProof, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(viewVerification).toBe(true);

//     const complexViewProof = YEP.createProof(viewPermission, editGrant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const complexViewVerification = YEP.verifyProof(viewPermission, complexViewProof, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(complexViewVerification).toBe(true);
//   });

//   it('grants permission and verifies proof', async () => {
//     const bobEncrypt = generateEncryptionKeyPair();
//     const bobSign = generateSigningKeyPair();

//     const { permission, grant: aliceGrant } = YEP.newPermission('VIEW', {}, aliceEncrypt.publicKey);
//     const aliceProof = YEP.createProof(permission, aliceGrant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const aliceVerification = YEP.verifyProof(permission, aliceProof, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(aliceVerification).toBe(true);

//     const bobsGrant = YEP.createGrant(aliceEncrypt.privateKey, aliceGrant, bobEncrypt.publicKey);
//     const bobProof = YEP.createProof(permission, bobsGrant, bobEncrypt.privateKey, bobSign.privateKey, service.publicKey);
//     expect(bobProof).not.toEqual(aliceProof);
//     expect(YEP.verifyProof(permission, bobProof, bobEncrypt.publicKey, bobSign.publicKey, service.privateKey)).toBe(true);
//   });

//   it('ensures unique proofs are created each time', async () => {
//     const { permission, grant } = YEP.newPermission('VIEW', {}, aliceEncrypt.publicKey);

//     const proof1 = YEP.createProof(permission, grant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const verification1 = YEP.verifyProof(permission, proof1, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(verification1).toBe(true);

//     const proof2 = YEP.createProof(permission, grant, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const verification2 = YEP.verifyProof(permission, proof2, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(verification2).toBe(true);

//     expect(proof1).not.toEqual(proof2); // Proofs must be unique to prevent replay attacks
//   });

//   it('fails verification with invalid grant', async () => {
//     const { permission: perm1, grant: grant1 } = YEP.newPermission('VIEW', {}, aliceEncrypt.publicKey);
//     const { permission: perm2, grant: grant2 } = YEP.newPermission('VIEW', {}, aliceEncrypt.publicKey);

//     const proof1 = YEP.createProof(perm1, grant1, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const verification1 = YEP.verifyProof(perm1, proof1, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(verification1).toBe(true);

//     const proof2 = YEP.createProof(perm2, grant2, aliceEncrypt.privateKey, aliceSign.privateKey, service.publicKey);
//     const verification2 = YEP.verifyProof(perm2, proof2, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey);
//     expect(verification2).toBe(true);

//     // Proof from perm2 should not be valid for perm1 and vice versa
//     expect(YEP.verifyProof(perm1, proof2, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey)).toBe(false);
//     expect(YEP.verifyProof(perm2, proof1, aliceEncrypt.publicKey, aliceSign.publicKey, service.privateKey)).toBe(false);
//   });
// });
