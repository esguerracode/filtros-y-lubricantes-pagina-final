
import md5 from 'md5';

export interface PayUPayload {
    merchantId: string;
    accountId: string;
    description: string;
    referenceCode: string;
    amount: string;
    tax: string;
    taxReturnBase: string;
    currency: string;
    signature: string;
    test: string;
    buyerEmail: string;
    responseUrl: string;
    confirmationUrl: string;
}

const PAYU_CONFIG = {
    merchantId: import.meta.env.VITE_PAYU_MERCHANT_ID || '',
    accountId: import.meta.env.VITE_PAYU_ACCOUNT_ID || '',
    apiKey: import.meta.env.VITE_PAYU_API_KEY || '',
    test: import.meta.env.VITE_PAYU_TEST === 'true' ? '1' : '0',
    responseUrl: `${window.location.origin}/success`,
    confirmationUrl: import.meta.env.VITE_PAYU_CONFIRMATION_URL || '',
};

/**
 * Genera la firma digital para PayU (MerchantId~ApiKey~ReferenceCode~Amount~Currency)
 */
export const generateSignature = (referenceCode: string, amount: number, currency: string = 'COP'): string => {
    const amountStr = amount.toString();
    const rawString = `${PAYU_CONFIG.apiKey}~${PAYU_CONFIG.merchantId}~${referenceCode}~${amountStr}~${currency}`;
    return md5(rawString);
};

export const preparePayUPayload = (
    orderReference: string,
    totalAmount: number,
    description: string,
    buyerEmail: string
): PayUPayload => {
    return {
        merchantId: PAYU_CONFIG.merchantId,
        accountId: PAYU_CONFIG.accountId,
        description: description.substring(0, 255),
        referenceCode: orderReference,
        amount: totalAmount.toString(),
        tax: '0',
        taxReturnBase: '0',
        currency: 'COP',
        signature: generateSignature(orderReference, totalAmount, 'COP'),
        test: PAYU_CONFIG.test,
        buyerEmail: buyerEmail,
        responseUrl: PAYU_CONFIG.responseUrl,
        confirmationUrl: PAYU_CONFIG.confirmationUrl,
    };
};

export const PAYU_CHECKOUT_URL = import.meta.env.VITE_PAYU_TEST === 'true'
    ? 'https://sandbox.checkout.payulatam.com/checkout-web-gateway-payu/'
    : 'https://checkout.payulatam.com/checkout-web-gateway-payu/';
