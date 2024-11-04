// codec.ts
import { DatagramCodec, DatagramMetadata, SymmetricKey } from "./crypto";
// import { PermissionGrant } from "./yep";

export type StringDatagramMetadata = {
  type: 'datagram://string',
  version: '0.1.0'
};

export const StringDatagramCodec: DatagramCodec<string, StringDatagramMetadata> = {
  metadata: { type: 'datagram://string', version: '0.1.0'},
  versionRange: '^0.1.0',
  serialize: str => new Uint8Array(Buffer.from(str)),
  deserialize: buf => Buffer.from(buf).toString()
};

export type NumberDatagramMetadata = {
  type: 'datagram://number',
  version: '0.1.0'
};

export const NumberDatagramCodec: DatagramCodec<number, NumberDatagramMetadata> = {
  metadata: { type: 'datagram://number', version: '0.1.0'},
  versionRange: '^0.1.0',
  serialize: n => new Uint8Array(Buffer.from(String(n))),
  deserialize: b => Number(Buffer.from(b).toString())
};

export type SymmetricKeyDatagramMetadata = {
  type: 'datagram://symmetric',
  version: '0.1.0'
};

export const SymmetricKeyDatagramCodec: DatagramCodec<SymmetricKey, SymmetricKeyDatagramMetadata> = {
  metadata: { type: 'datagram://symmetric', version: '0.1.0'},
  versionRange: '^0.1.0',
  serialize: k => k,
  deserialize: k => k
};

// Codec for PermissionGrant
export type PermissionGrantDatagramMetadata = {
  type: 'datagram://permission_grant',
  version: '0.1.0'
};

// export const PermissionGrantDatagramCodec: DatagramCodec<PermissionGrant<string>, PermissionGrantDatagramMetadata> = {
//   metadata: { type: 'datagram://permission_grant', version: '0.1.0' },
//   versionRange: '^0.1.0',
//   serialize: (grant) => {
//     const grantObj = {
//       name: grant.name,
//       grantKey: Array.from(grant.grantKey.payload)
//     };
//     return new Uint8Array(Buffer.from(JSON.stringify(grantObj)));
//   },
//   deserialize: (bytes) => {
//     const { name, grantKey } = JSON.parse(Buffer.from(bytes).toString());
//     return {
//       name,
//       grantKey: {
//         payload: Buffer.from(grantKey).toString(),
//         metadata: { type: 'datagram://symmetric', version: '0.1.0' }
//       }
//     };
//   }
// };

// export const createJsonDatagramCodec = <T, M extends DatagramMetadata>(
//   metadata: M, 
//   versionRange: string = '^0.1.0'
// ): DatagramCodec<T, M> => {
//   return {
//     metadata,
//     versionRange,
//     serialize: (data: T) => new Uint8Array(Buffer.from(JSON.stringify(data))),
//     deserialize: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString())
//   };
// };
