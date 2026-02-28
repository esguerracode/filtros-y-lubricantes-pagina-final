import { sendOrderConfirmationEmail } from '../api/_utils/email.ts';

async function run() {
    console.log('Sending test email via Brevo...');
    try {
        const res = await sendOrderConfirmationEmail({
            to: 'filtrosylubricantesdelllano@gmail.com', // Sending to yourself to test
            customerName: 'Prueba Vercel',
            reference: 'TEST-12345',
            transactionId: 'TXN-98765',
            amount: '50000',
            items: [
                { name: 'Filtro Test', quantity: 1, price: 50000 }
            ],
            whatsapp: '3143930345'
        });
        console.log('Success:', res);
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

run();
