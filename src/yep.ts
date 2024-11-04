// // yep.ts

// import { AEAD, DatagramCodec, DatagramMetadata, EncryptedDatagram, EncryptionPrivateKey, EncryptionPublicKey, generateKeyPair, generateSymmetricKey, SymmetricKey } from "../src/crypto";
// import { SymmetricKeyDatagramCodec, PermissionGrantDatagramCodec, createJsonDatagramCodec, SymmetricKeyDatagramMetadata, PermissionGrantDatagramMetadata } from "../src/codec";

// export type PermissionSecret<Name extends string> = { 
//   name: Name, 
//   key: SymmetricKey 
// };

// export interface PermissionPublicKey extends EncryptionPublicKey {
//   subtype: 'permission';
//   name: string;
// }

// export interface PermissionPrivateKey extends EncryptionPrivateKey {
//   subtype: 'permission';
//   name: string;
// }

// export interface ServicePublicKey extends EncryptionPublicKey {
//   subtype: 'service';
// }

// export interface ServicePrivateKey extends EncryptionPrivateKey {
//   subtype: 'service';
// }

// type PermissionDataType<Keys extends string> = { 
//   [Key in Keys]: PermissionPrivateKey 
// };

// export type PermissionData<Keys extends string, Name extends string> = { 
//   privateKey: PermissionPrivateKey, 
//   data: PermissionDataType<Keys>
// };

// export interface PermissionDataDatagramMetadata<Name extends string> extends DatagramMetadata {
//   type: `datagram://permission_${Name}`;
//   version: '0.1.0';
// }

// export type Permission<Keys extends string, Name extends string> = {
//   name: Name,
//   publicKey: PermissionPublicKey,
//   privateData: EncryptedDatagram<PermissionData<Keys, Name>, PermissionDataDatagramMetadata<Name>>;
// };

// export type PermissionGrant<Name extends string> = { 
//   name: Name, 
//   grantKey: EncryptedDatagram<SymmetricKey, SymmetricKeyDatagramMetadata> 
// };

// export class YEP {
//   private static getCodec<Keys extends string, Name extends string>(
//     name: Name
//   ): DatagramCodec<PermissionData<Keys, Name>, PermissionDataDatagramMetadata<Name>> {
//     const datagramMetadata: PermissionDataDatagramMetadata<Name> = {
//       type: `datagram://permission_${name}`,
//       version: '0.1.0'
//     };
//     return createJsonDatagramCodec(datagramMetadata);
//   }

//   static newPermission<Keys extends string, Name extends string>(
//     name: Name, 
//     data: PermissionDataType<Keys>, 
//     myPublicKey: EncryptionPublicKey
//   ): { 
//     permission: Permission<Keys, Name>, 
//     grant: PermissionGrant<Name> 
//   } {
//     const { publicKey, privateKey } = generateKeyPair();
//     const permissionSecret = generateSymmetricKey();

//     const permissionData: PermissionData<Keys, Name> = { 
//       privateKey: { ...privateKey, name, subtype: 'permission' }, 
//       data 
//     };

//     const privateData = AEAD.encryptSymmetric(
//       permissionData, 
//       YEP.getCodec(name), 
//       permissionSecret
//     );

//     return { 
//       permission: { 
//         name, 
//         publicKey: { ...publicKey, name, subtype: 'permission' }, 
//         privateData 
//       }, 
//       grant: {
//         name, 
//         grantKey: AEAD.encryptAsymmetric(
//           permissionSecret, 
//           SymmetricKeyDatagramCodec,  // Encrypting symmetric key directly
//           myPublicKey.key
//         ) 
//       }
//     };
//   }

//   static createProof<Name extends string>(
//     permission: Permission<never, Name>, 
//     grant: PermissionGrant<Name>, 
//     privateKey: EncryptionPrivateKey, 
//     signingKey: EncryptionPrivateKey, 
//     servicePublicKey: EncryptionPublicKey
//   ): EncryptedDatagram<PermissionGrant<Name>, PermissionGrantDatagramMetadata> {
//     // Create a proof by encrypting the PermissionGrant using asymmetric encryption
//     return AEAD.encryptAsymmetric(grant, PermissionGrantDatagramCodec, servicePublicKey.key);
//   }

//   static verifyProof<Name extends string>(
//     permission: Permission<never, Name>, 
//     proof: EncryptedDatagram<PermissionGrant<Name>, PermissionGrantDatagramMetadata>, 
//     publicKey: EncryptionPublicKey, 
//     signingPublicKey: EncryptionPublicKey, 
//     servicePrivateKey: EncryptionPrivateKey
//   ): boolean {
//     try {
//       // Decrypt the proof and check if the grant name matches the permission
//       const decryptedGrant = AEAD.decryptAsymmetric(proof, PermissionGrantDatagramCodec, servicePrivateKey.key);
//       return decryptedGrant.name === permission.name;
//     } catch (e) {
//       return false;
//     }
//   }

//   static createGrant<Name extends string>(
//     myPrivateKey: EncryptionPrivateKey, 
//     myPermissionGrant: PermissionGrant<Name>, 
//     theirPublicKey: EncryptionPublicKey
//   ): PermissionGrant<Name> {
//     const symmetricKey = AEAD.decryptAsymmetric(
//       myPermissionGrant.grantKey, 
//       SymmetricKeyDatagramCodec,  // Decrypts symmetric key directly
//       myPrivateKey.key
//     );

//     return {
//       name: myPermissionGrant.name, 
//       grantKey: AEAD.encryptAsymmetric(
//         symmetricKey, 
//         SymmetricKeyDatagramCodec,  // Re-encrypt symmetric key for other party
//         theirPublicKey.key
//       )
//     };
//   }
// }
