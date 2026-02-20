/**
 * Wompi Payment Gateway Service
 * API de Pagos Colombia - Bancolombia
 * Documentación: https://docs.wompi.co
 */

// ============================================================
// CONFIGURATION
// ============================================================

interface WompiConfig {
    publicKey: string;
    isTest: boolean;
    currency: string;
    redirectUrl: string;
}

const WOMPI_CONFIG: WompiConfig = {
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY || '',
    isTest: import.meta.env.VITE_WOMPI_TEST === 'true',
    currency: 'COP',
    redirectUrl: import.meta.env.VITE_WOMPI_REDIRECT_URL || window.location.origin + '/success'
};

const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/p/';

// ============================================================
// TYPES
// ============================================================

export interface WompiCustomer {
    email: string;
    fullName: string;
    phoneNumber: string;
    phoneNumberPrefix: string;
    legalId?: string;
    legalIdType?: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI';
}

export interface WompiShippingAddress {
    country: string;
    city: string;
    address: string;
    department: string;
    postalCode?: string;
}

export interface WompiProduct {
    name: string;
    quantity: number;
    price: number;
}

export interface WompiTransactionData {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    reference: string;
    publicKey: string;
    redirectUrl?: string;
    taxInCents?: number;
    customerData?: WompiCustomer;
    shippingAddress?: WompiShippingAddress;
    signature?: string; // Wompi integrity signature
}

export interface WompiTransactionResponse {
    data: {
        id: string;
        created_at: string;
        amount_in_cents: number;
        reference: string;
        customer_email: string;
        currency: string;
        payment_method_type: string;
        redirect_url: string;
        status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
        status_message: string | null;
        shipping_address: WompiShippingAddress | null;
        customer_data: WompiCustomer | null;
    };
}

// ============================================================
// PAYMENT HELPERS
// ============================================================

export const generateReference = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `FYL-${timestamp}-${random}`;
};

export const copToCents = (amount: number): number => {
    return Math.round(amount * 100);
};

export const centsToCop = (cents: number): number => {
    return cents / 100;
};

// ============================================================
// ORDER CREATION + WOMPI DATA
// ============================================================

export const createOrderAndGetWompiData = async (
    cart: any[],
    customerData: WompiCustomer,
    shippingAddress: WompiShippingAddress
): Promise<WompiTransactionData> => {

    const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: cart,
            customer: {
                ...customerData,
                city: shippingAddress.city
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creando orden: ${errorText}`);
    }

    const orderData = await response.json();
    // orderData: { reference, amountInCents, total, currency, key, signature }

    return {
        amountInCents: orderData.amountInCents,
        currency: orderData.currency,
        customerEmail: customerData.email,
        reference: orderData.reference,
        publicKey: WOMPI_CONFIG.publicKey,
        redirectUrl: WOMPI_CONFIG.redirectUrl,
        customerData,
        shippingAddress,
        signature: orderData.signature
    };
};

// ============================================================
// WOMPI WIDGET
// ============================================================

export const openWompiWidget = (transactionData: WompiTransactionData) => {
    const checkWidget = setInterval(() => {
        if ((window as any).WidgetCheckout) {
            clearInterval(checkWidget);

            const widgetConfig: any = {
                currency: transactionData.currency,
                amountInCents: transactionData.amountInCents,
                reference: transactionData.reference,
                publicKey: transactionData.publicKey
            };

            if (transactionData.signature) {
                widgetConfig.signature = { integrity: transactionData.signature };
            }

            if (transactionData.redirectUrl) {
                widgetConfig.redirectUrl = transactionData.redirectUrl;
            }

            if (transactionData.customerData?.email) {
                widgetConfig.customerData = {
                    email: transactionData.customerData.email,
                    fullName: transactionData.customerData.fullName,
                    phoneNumber: transactionData.customerData.phoneNumber,
                    phoneNumberPrefix: transactionData.customerData.phoneNumberPrefix,
                    legalId: transactionData.customerData.legalId,
                    legalIdType: transactionData.customerData.legalIdType
                };
            }

            console.log('🔹 Wompi Widget Config:', JSON.stringify(widgetConfig, null, 2));

            const checkout = new (window as any).WidgetCheckout(widgetConfig);

            checkout.open((result: any) => {
                if (!result || !result.transaction) {
                    console.error('❌ No transaction data received from Wompi');
                    return;
                }

                const transaction = result.transaction;
                console.log('✅ Wompi transaction result:', transaction);

                const redirectBase = transactionData.redirectUrl || window.location.origin + '/success';

                if (transaction.status === 'APPROVED') {
                    window.location.href = `${redirectBase}?status=approved&reference=${transaction.reference}&id=${transaction.id}`;
                } else if (transaction.status === 'DECLINED') {
                    window.location.href = `${redirectBase}?status=declined&reference=${transaction.reference}`;
                } else {
                    window.location.href = `${redirectBase}?status=pending&reference=${transaction.reference}`;
                }
            });
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkWidget);
        if (!(window as any).WidgetCheckout) {
            alert('Error cargando pasarela de pago. Por favor recarga la página e intenta nuevamente.');
            console.error('❌ Wompi widget failed to load after 10 seconds');
        }
    }, 10000);
};

// ============================================================
// PAYMENT LINK GENERATOR (alternative to widget)
// ============================================================

export const generateWompiPaymentLink = (transactionData: WompiTransactionData): string => {
    const baseUrl = 'https://checkout.wompi.co/l';

    const params = new URLSearchParams({
        'public-key': transactionData.publicKey,
        currency: transactionData.currency,
        'amount-in-cents': transactionData.amountInCents.toString(),
        reference: transactionData.reference
    });

    if (transactionData.redirectUrl) {
        params.append('redirect-url', transactionData.redirectUrl);
    }

    if (transactionData.customerData) {
        const { email, fullName, phoneNumber, phoneNumberPrefix, legalId, legalIdType } = transactionData.customerData;
        if (email) params.append('customer-data:email', email);
        if (fullName) params.append('customer-data:full-name', fullName);
        if (phoneNumber && phoneNumberPrefix) {
            params.append('customer-data:phone-number', phoneNumber);
            params.append('customer-data:phone-number-prefix', phoneNumberPrefix);
        }
        if (legalId) params.append('customer-data:legal-id', legalId);
        if (legalIdType) params.append('customer-data:legal-id-type', legalIdType);
    }

    if (transactionData.shippingAddress) {
        const { address, city, department, country, postalCode } = transactionData.shippingAddress;
        if (address) params.append('shipping-address:address-line-1', address);
        if (city) params.append('shipping-address:city', city);
        if (department) params.append('shipping-address:region', department);
        if (country) params.append('shipping-address:country', country);
        if (postalCode) params.append('shipping-address:postal-code', postalCode);
    }

    return `${baseUrl}?${params.toString()}`;
};

// ============================================================
// EXPORTS
// ============================================================

export { WOMPI_CONFIG, WOMPI_WIDGET_URL };

export default {
    generateReference,
    createOrderAndGetWompiData,
    openWompiWidget,
    generateWompiPaymentLink,
    copToCents,
    centsToCop
};
