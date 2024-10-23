import CryptoJS from 'crypto-js';
import { CIPHER_KEY, CIPHER_IV } from './CONSTANTS';
// const CryptoJS = require('crypto-js');

const cipherkey = CryptoJS.enc.Utf8.parse(CIPHER_KEY);
const cipherIV = CryptoJS.enc.Utf8.parse(CIPHER_IV);
const options = {
	iv: cipherIV,
	blockSize: 128,
	keySize: 256,
	mode: CryptoJS.mode.CBC,
	padding: CryptoJS.pad.Pkcs7
};

class CipherService {
	encrypt = (plainText) => {
		const cipherText = CryptoJS.AES.encrypt(plainText, cipherkey, options);
		return cipherText.toString();
	};

	decrypt = (cipherText) => {
		const plainText = CryptoJS.AES.decrypt(cipherText, cipherkey, {
			iv: cipherIV
		});
		return plainText.toString();
	};
}

const instance = new CipherService();

export default instance;
