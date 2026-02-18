import axios, { AxiosInstance } from 'axios';

let apiInstance: AxiosInstance | null = null;

export function getApi(): AxiosInstance {
    if (apiInstance) return apiInstance;

    const WC_URL = process.env.VITE_WP_URL || process.env.WP_URL;
    const CK = process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
    const CS = process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

    if (!WC_URL || !CK || !CS) {
        // Enforce check
        if (process.env.NODE_ENV !== 'test') { // Allow mocking in tests
            console.error('Missing WooCommerce Config:', { WC_URL, hasCK: !!CK, hasCS: !!CS });
        }
    }

    apiInstance = axios.create({
        baseURL: `${WC_URL}/wp-json/wc/v3`,
        auth: {
            username: CK || '',
            password: CS || ''
        }
    });

    return apiInstance;
}

export async function getProduct(id: number) {
    const { data } = await getApi().get(`products/${id}`);
    return data;
}

export async function createOrder(orderData: any) {
    const { data } = await getApi().post('orders', orderData);
    return data;
}

export async function updateOrder(id: number, updateData: any) {
    const { data } = await getApi().put(`orders/${id}`, updateData);
    return data;
}

export async function updateOrderWithRetry(id: number, updateData: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await updateOrder(id, updateData);
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
        }
    }
}

export async function getOrderByReference(ref: string) {
    // WC doesn't verify uniqueness of ID in a simple GET, 
    // but our flow guarantees Ref = WC-{id}, so we just parse ID.
    const id = parseInt(ref.replace('WC-', ''));
    if (isNaN(id)) return null;

    try {
        const { data } = await getApi().get(`orders/${id}`);
        return data;
    } catch (e) {
        return null;
    }
}
