export default function handler(req: any, res: any) {
    res.status(200).json({
        message: 'API is working',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_WP_URL: !!process.env.VITE_WP_URL,
            HAS_WC_KEY: !!process.env.WC_CONSUMER_KEY,
            HAS_WC_SECRET: !!process.env.WC_CONSUMER_SECRET,
            HAS_WOMPI_KEY: !!process.env.WOMPI_PRIVATE_KEY
        }
    });
}
