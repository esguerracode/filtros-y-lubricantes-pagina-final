import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

import { WooCommerce } from '../api/_utils/woo';

async function verifyConnection() {
    console.log('🔌 Testing WooCommerce Connection...');
    try {
        const response = await WooCommerce.get('system_status');
        console.log('✅ Connection Successful!');
        console.log('URL:', response.data.environment.site_url);
        console.log('WC Version:', response.data.environment.version);
    } catch (error: any) {
        console.error('❌ Connection Failed:', error.response ? error.response.data : error.message);
    }
}

verifyConnection();
