import axios from 'axios';
import crypto from 'crypto';

import 'dotenv/config'; // Load env vars

// CONFIG
const SECRET = process.env.WOMPI_EVENTS_SECRET || 'test_secret_REPLACE_ME_WITH_REAL_ENV_IF_TESTING_LOCALLY';
const WEBHOOK_URL = process.env.VITE_WOMPI_REDIRECT_URL ? `${new URL(process.env.VITE_WOMPI_REDIRECT_URL).origin}/api/webhooks/wompi` : 'http://localhost:3000/api/webhooks/wompi';

// PAYLOAD GENERATOR
const payload = {
    event: "transaction.updated",
    data: {
        transaction: {
            id: "TX-12345-" + Date.now(),
            created_at: new Date().toISOString(),
            amount_in_cents: 5000000, // $50.000
            reference: "WC-1050", // CHANGE THIS TO A REAL ORDER ID FOR E2E TEST
            customer_email: "test@test.com",
            currency: "COP",
            payment_method_type: "CARD",
            status: "APPROVED",
            status_message: null,
            shipping_address: null,
            redirect_url: "http://localhost:3000/success",
            payment_source_id: null,
            payment_link_id: null,
            customer_data: null,
            bill_id: null,
            taxes: [],
            tip_in_cents: null
        }
    },
    environment: "test",
    signature: {
        properties: [
            "transaction.id",
            "transaction.status",
            "transaction.amount_in_cents"
        ],
        checksum: "NOT_USED_IN_NEW_VERSION"
    },
    timestamp: Math.floor(Date.now() / 1000),
    sent_at: new Date().toISOString()
};

// GENERATE SIGNATURE
const chain = `${payload.timestamp}${payload.data.transaction.id}${payload.data.transaction.status}${payload.data.transaction.amount_in_cents}`;
const signature = crypto.createHmac('sha256', SECRET).update(chain).digest('hex');

// SEND
console.log('🚀 Sending Webhook...');
console.log('ID:', payload.data.transaction.id);
console.log('Ref:', payload.data.transaction.reference);
console.log('Sig:', signature);

axios.post(WEBHOOK_URL, payload, {
    headers: {
        'x-event-signature': signature
    }
})
    .then(res => {
        console.log('✅ Status:', res.status);
        console.log('📄 Body:', res.data);
    })
    .catch(err => {
        console.error('❌ Error:', err.response ? err.response.data : err.message);
    });
