import { getProduct } from './_utils/woo.js';

export default async function handler(req: any, res: any) {
    try {
        // Try to get a known product ID (e.g. 121 from my earlier test)
        const product = await getProduct(121);
        return res.status(200).json({
            success: true,
            productName: product.name,
            price: product.price
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            config: {
                url: process.env.VITE_WP_URL,
                hasCK: !!process.env.WC_CONSUMER_KEY,
                hasCS: !!process.env.WC_CONSUMER_SECRET
            }
        });
    }
}
