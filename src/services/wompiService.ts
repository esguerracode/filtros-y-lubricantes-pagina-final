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
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY || '',
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
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.baseURL = baseURL;
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
/**
 * Crea la orden en el backend y prepara los datos para Wompi
 * REEMPLAZA a prepareWompiTransaction (que era sincrono local)
 */
export const createOrderAndGetWompiData = async (
    cart: any[],
    customerData: WompiCustomer,
    shippingAddress: WompiShippingAddress
): Promise<WompiTransactionData> => {

    // 1. Llamar a nuestra propia API para crear la orden segura y obtener firma
    const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: cart,
            customer: {
                ...customerData,
                city: shippingAddress.city // Ensure city is passed for Telegram
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creando orden: ${errorText}`);
    }

    const orderData = await response.json();
    // orderData: { id, total, currency, reference, key, signature, amountInCents }

    // 2. Retornar objeto listo para openWompiWidget
    return {
        amountInCents: orderData.amountInCents,
        currency: orderData.currency,
        customerEmail: customerData.email,
        reference: orderData.reference, // La referencia generada por el backend
        publicKey: WOMPI_CONFIG.publicKey,
        redirectUrl: WOMPI_CONFIG.redirectUrl,
        customerData,
        shippingAddress,
        signature: orderData.signature // IMPORTANT: Wompi widget needs this if integrity is enabled
    };
};


/**
 * Abrir widget de Wompi
 * Abre el modal de pagos oficial de Wompi
 */
export const openWompiWidget = (transactionData: WompiTransactionData) => {
    // Script ya está pre-cargado en index.html
    // Esperar a que el widget esté disponible
    const checkWidget = setInterval(() => {
        if ((window as any).WidgetCheckout) {
            clearInterval(checkWidget);

            // CONFIGURACIÓN OFICIAL SEGÚN DOCS DE WOMPI
            // https://docs.wompi.co/docs/colombia/widget-checkout/
            const widgetConfig: any = {
                currency: transactionData.currency,
                amountInCents: transactionData.amountInCents,
                reference: transactionData.reference,
                publicKey: transactionData.publicKey
            };

            // redirectUrl es opcional pero recomendado
            if (transactionData.redirectUrl) {
                widgetConfig.redirectUrl = transactionData.redirectUrl;
            }

            // Customer Data (Optional for Widget but good for pre-filling)
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

            // Crear instancia del widget
            const checkout = new (window as any).WidgetCheckout(widgetConfig);

            // Abrir widget con callback
            checkout.open((result: any) => {
                if (!result || !result.transaction) {
                    console.error('❌ No transaction data received from Wompi');
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
                } else {
                    window.location.href = `${redirectUrl}?status=pending&reference=${transaction.reference}`;
                }
            });
        }
    }, 100);  // Revisar cada 100ms

    // Timeout de seguridad (10 segundos)
    setTimeout(() => {
        clearInterval(checkWidget);
        if (!(window as any).WidgetCheckout) {
            alert('Error cargando pasarela de pago. Por favor recarga la página e intenta nuevamente.');
            console.error('❌ Wompi widget failed to load after 10 seconds');
        }
    }, 10000);
};

/**
 * Genera un link de pago de Wompi con todos los datos del cliente
 * El cliente será redirigido a la página de checkout de Wompi
 */
export const generateWompiPaymentLink = (transactionData: WompiTransactionData): string => {
    const baseUrl = 'https://checkout.wompi.co/l';

    const params = new URLSearchParams({
        'public-key': transactionData.publicKey,
        currency: transactionData.currency,
        'amount-in-cents': transactionData.amountInCents.toString(),
        reference: transactionData.reference
    });

    // Redirect URL
    if (transactionData.redirectUrl) {
        params.append('redirect-url', transactionData.redirectUrl);
    }

    // Customer Data
    if (transactionData.customerData) {
        if (transactionData.customerData.email) {
            params.append('customer-data:email', transactionData.customerData.email);
        }
        if (transactionData.customerData.fullName) {
            params.append('customer-data:full-name', transactionData.customerData.fullName);
        }
        if (transactionData.customerData.phoneNumber && transactionData.customerData.phoneNumberPrefix) {
            params.append('customer-data:phone-number', transactionData.customerData.phoneNumber);
            params.append('customer-data:phone-number-prefix', transactionData.customerData.phoneNumberPrefix);
        }
        if (transactionData.customerData.legalId) {
            params.append('customer-data:legal-id', transactionData.customerData.legalId);
        }
        if (transactionData.customerData.legalIdType) {
            params.append('customer-data:legal-id-type', transactionData.customerData.legalIdType);
        }
    }

    // Shipping Address
    if (transactionData.shippingAddress) {
        if (transactionData.shippingAddress.address) {
            params.append('shipping-address:address-line-1', transactionData.shippingAddress.address);
        }
        if (transactionData.shippingAddress.city) {
            params.append('shipping-address:city', transactionData.shippingAddress.city);
        }
        if (transactionData.shippingAddress.department) {
            params.append('shipping-address:region', transactionData.shippingAddress.department);
        }
        if (transactionData.shippingAddress.country) {
            params.append('shipping-address:country', transactionData.shippingAddress.country);
        }
        if (transactionData.shippingAddress.postalCode) {
            params.append('shipping-address:postal-code', transactionData.shippingAddress.postalCode);
        }
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
