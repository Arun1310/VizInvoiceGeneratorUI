let APP_BASE_URL;

if (process.env.NODE_ENV !== 'production') {
	APP_BASE_URL = 'https://localhost:44311/';
} else {
	// APP_BASE_URL = 'https://depotoncloudapi.azurewebsites.net/';
}

export const BASE_URL = APP_BASE_URL;
export const CIPHER_KEY = 'TRADING@123PORTAL@XYZVIZOROZ1234';
export const CIPHER_IV = 'VIZORO@123TRADIN';
export const COUNTRYSTATECITY_API_KEY = 'VGlIcFd2WmVzZ2dDM1FhSWhXZlNFQVFjZFVvR3pTWUZEQjhRQzdUdA==';
