declare module 'post_body_encrypt_decrypt' {
    class EncryptDecrypt {
        generateSymmetricKey(): any;
        encryptDecrypt(data: any, key: string, action: string): any;
    }
    export default EncryptDecrypt;
}