import EncryptDecrypt from "post_body_encrypt_decrypt";

export const encryptDecrypt = new EncryptDecrypt();

export const key = encryptDecrypt.generateSymmetricKey();


