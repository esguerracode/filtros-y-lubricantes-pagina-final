/**
 * Wompi Payment Gateway Service
 * API de Pagos Colombia - Bancolombia
 * 
 * Documentación: https://docs.wompi.co
 * Dashboard: https://comercios.wompi.co
 */

// ============================================================
// CONFIGURATION
// ============================================================

interface WompiConfig {
    publicKey: string;
    privateKey: string;
    isTest: boolean;
    currency: string;
    redirectUrl: string;
}

const WOMPI_CONFIG: WompiConfig = {
    // FALLBACK DE EMERGENCIA: Si la variable de entorno falla, usar la llave de sandbox directamente
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_Q5yDA9zoKstU483bcEn0LQvloKuNUR9z',
    privateKey: import.meta.env.VITE_WOMPI_PRIVATE_KEY || '',
    isTest: import.meta.env.VITE_WOMPI_TEST === 'true',
    currency: 'COP',
    redirectUrl: import.meta.env.VITE_WOMPI_REDIRECT_URL || window.location.origin + '/success'
};

// API URLs
const WOMPI_API_URL = WOMPI_CONFIG.isTest
    ? 'https://sandbox.wompi.co/v1'
    : 'https://production.wompi.co/v1';

const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/p/';

// ============================================================
// TYPES
// ============================================================

export interface WompiCustomer {
    email: string;
    fullName: string;
    phoneNumber: string;
    phoneNumberPrefix: string; // Código de país (ej: +57 para Colombia)
    legalId?: string; // Cédula (OPCIONAL - el widget lo pide al usuario)
    legalIdType?: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI'; // OPCIONAL
}

// Estructura de dirección de envío para Wompi (DOCUMENTACIÓN OFICIAL)
// Basado en: https://wompi.com/es/co/desarrolladores/documentacion-tecnica
export interface WompiShippingAddress {
    country: string;       // Código ISO país (ej: "CO")
    city: string;          // Ciudad
    address: string;       // Dirección completa (NO "addressLine1")
    department: string;    // Departamento (NO "region")
    postalCode?: string;   // Código postal (opcional)
    // NOTA: phoneNumber NO va aquí, va en customerData
}

export interface WompiProduct {
    name: string;
    quantity: number;
    price: number; // En centavos
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
}

export interface WompiAcceptanceToken {
    acceptanceToken: string;
    permalink: string;
    type: string;
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
        payment_link_id: string | null;
        redirect_url: string;
        status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
        status_message: string | null;
        shipping_address: WompiShippingAddress | null;
        payment_source_id: number | null;
        payment_method: object | null;
        customer_data: WompiCustomer | null;
    };
}

// ============================================================
// API CLIENT
// ============================================================

class WompiClient {
    private baseURL: string;
    private publicKey: string;
    private privateKey: string;

    constructor(publicKey: string, privateKey: string, baseURL: string) {
        this.publicKey = publicKey || '';
        this.privateKey = privateKey || '';
        this.baseURL = baseURL;

        if (!this.publicKey) {
            console.error('❌ Wompi Error: La llave pública es indefinida. Revisa tu archivo .env.local');
        }
    }

    /**
     * Obtiene el token de aceptación de términos y condiciones
     * Requerido para crear transacciones
     */
    async getAcceptanceToken(): Promise<WompiAcceptanceToken> {
        const response = await fetch(`${this.baseURL}/merchants/${this.publicKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get acceptance token: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.presigned_acceptance;
    }

    /**
     * Crea una transacción de pago
     */
    async createTransaction(transactionData: WompiTransactionData): Promise<WompiTransactionResponse> {
        // Primero obtener el acceptance token
        const acceptance = await this.getAcceptanceToken();

        const payload = {
            ...transactionData,
            acceptance_token: acceptance.acceptanceToken,
            customer_data: transactionData.customerData
        };

        const response = await fetch(`${this.baseURL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.privateKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Transaction failed: ${errorData.error?.messages || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Obtiene el estado de una transacción
     */
    async getTransactionStatus(transactionId: string): Promise<WompiTransactionResponse> {
        const response = await fetch(`${this.baseURL}/transactions/${transactionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.privateKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get transaction status: ${response.statusText}`);
        }

        return await response.json();
    }
}

// ============================================================
// PAYMENT HELPERS
// ============================================================

/**
 * Genera una referencia única para la transacción
 */
export const generateReference = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `FYL-${timestamp}-${random}`;
};

/**
 * Convierte pesos colombianos a centavos
 */
export const copToCents = (amount: number): number => {
    return Math.round(amount * 100);
};

/**
 * Convierte centavos a pesos colombianos
 */
export const centsToCop = (cents: number): number => {
    return cents / 100;
};

/**
 * Prepara los datos de la transacción para Wompi
 */
export const prepareWompiTransaction = (
    cart: any[],
    total: number,
    customerData: WompiCustomer,
    shippingAddress: WompiShippingAddress
): WompiTransactionData => {
    const reference = generateReference();
    const amountInCents = copToCents(total);

    return {
        amountInCents,
        currency: WOMPI_CONFIG.currency,
        customerEmail: customerData.email,
        reference,
        publicKey: WOMPI_CONFIG.publicKey,
        redirectUrl: WOMPI_CONFIG.redirectUrl,
        customerData,
        shippingAddress
    };
};

/**
 * Abrir widget de Wompi (método alternativo - puede fallar en localhost con claves de producción)
 * @deprecated Usar generateWompiPaymentLink para mayor confiabilidad
 */
export const openWompiWidget = (transactionData: WompiTransactionData) => {
    // Script ya está pre-cargado en index.html
    // Esperar a que el widget esté disponible
    const checkWidget = setInterval(() => {
        if ((window as any).WidgetCheckout) {
            clearInterval(checkWidget);

            // CONFIGURACIÓN OFICIAL SEGÚN DOCS DE WOMPI (v1.0.0)
            // https://docs.wompi.co/docs/colombia/widget-checkout/
            const widgetConfig: any = {
                currency: transactionData.currency,
                amountInCents: transactionData.amountInCents,
                reference: transactionData.reference,
                publicKey: transactionData.publicKey,
                redirectUrl: transactionData.redirectUrl, // Explicitly pass redirectUrl
                customerData: {
                    email: transactionData.customerData?.email,
                    fullName: transactionData.customerData?.fullName,
                    phoneNumber: transactionData.customerData?.phoneNumber,
                    phoneNumberPrefix: transactionData.customerData?.phoneNumberPrefix
                },
                shippingAddress: {
                    addressLine1: transactionData.shippingAddress?.address,
                    city: transactionData.shippingAddress?.city,
                    region: transactionData.shippingAddress?.department,
                    country: transactionData.shippingAddress?.country,
                    phoneNumber: transactionData.customerData?.phoneNumber
                }
            };

            console.log('🔹 Wompi Widget Config:', JSON.stringify(widgetConfig, null, 2));

            // Crear instancia del widget
            const checkout = new (window as any).WidgetCheckout(widgetConfig);

            // Abrir widget con callback
            checkout.open((result: any) => {
                if (!result || !result.transaction) {
                    console.warn('⚠️ No transaction data or widget closed. Checking for fallback...');
                    return;
                }

                const transaction = result.transaction;
                console.log('✅ Wompi transaction result:', transaction);

                // Redirigir según status
                const redirectUrl = transactionData.redirectUrl || window.location.origin;
                if (transaction.status === 'APPROVED') {
                    window.location.href = `${redirectUrl}?status=approved&reference=${transaction.reference}&id=${transaction.id}`;
                } else if (transaction.status === 'DECLINED') {
                    window.location.href = `${redirectUrl}?status=declined&reference=${transaction.reference}`;
                } else if (transaction.status === 'PENDING') {
                    window.location.href = `${redirectUrl}?status=pending&reference=${transaction.reference}`;
                }
            });
        }
    }, 100);  // Revisar cada 100ms

    // Timeout de seguridad (5 segundos para el widget)
    // Si falla, disparamos el REDIRECT LINK (Fallback 403 Safety)
    setTimeout(() => {
        clearInterval(checkWidget);
        if (!(window as any).WidgetCheckout) {
            console.warn('🚨 Wompi Widget failed to load. Triggering RESILIENCE REDIRECT...');
            const fallbackLink = generateWompiPaymentLink(transactionData);
            window.location.href = fallbackLink;
        }
    }, 5000);
};

/**
 * Genera un link de pago de Wompi con todos los datos del cliente
 * El cliente será redirigido a la página de checkout de Wompi
 */
export const generateWompiPaymentLink = (transactionData: WompiTransactionData): string => {
    // CORRECCIÓN CRÍTICA: Usar endpoint /p/ (WebCheckout) en lugar de /l (Links pre-creados)
    const baseUrl = 'https://checkout.wompi.co/p/';

    // VALIDACIÓN DE LLAVE PÚBLICA
    // Si la llave viene vacía, undefined o es un placeholder, usar la llave de sandbox conocida
    let finalPublicKey = transactionData.publicKey;
    if (!finalPublicKey || finalPublicKey === 'undefined' || finalPublicKey === '') {
        console.warn('⚠️ Wompi Public Key faltante. Usando llave de Sandbox por defecto.');
        finalPublicKey = 'pub_test_Q5yDA9zoKstU483bcEn0LQvloKuNUR9z';
    }

    const params = new URLSearchParams({
        'public-key': finalPublicKey,
        currency: transactionData.currency,
        'amount-in-cents': transactionData.amountInCents.toString(),
        reference: transactionData.reference
    });

    // Customer Data Simplificado (Solo lo esencial para evitar bloqueos por longitud de URL)
    if (transactionData.customerData?.email) {
        params.append('customer-data:email', transactionData.customerData.email);
    }
    if (transactionData.customerData?.fullName) {
        params.append('customer-data:full-name', transactionData.customerData.fullName);
    }
    if (transactionData.customerData?.phoneNumber) {
        params.append('customer-data:phone-number', transactionData.customerData.phoneNumber);
    }

    return `${baseUrl}?${params.toString()}`;
};

// ============================================================
// EXPORTS
// ============================================================

export const wompiClient = new WompiClient(
    WOMPI_CONFIG.publicKey,
    WOMPI_CONFIG.privateKey,
    WOMPI_API_URL
);

export { WOMPI_CONFIG, WOMPI_API_URL };

export default {
    client: wompiClient,
    generateReference,
    prepareWompiTransaction,
    openWompiWidget,
    generateWompiPaymentLink,
    copToCents,
    centsToCop
};
