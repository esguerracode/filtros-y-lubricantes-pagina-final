// testing/verify_production_order.ts
const PROD_URL = 'https://filtrosylubricantes.co';

async function testOrderCreation() {
    console.log('🧪 Testing order creation on production...');

    const payload = {
        items: [{ id: 121, quantity: 1, price: 50 }], // Mock product
        customer: {
            fullName: 'Test Deploy',
            email: 'test@example.com',
            phoneNumber: '3001234567',
            address: 'Calle Falsa 123',
            city: 'Bogota',
            department: 'Bogota'
        }
    };

    try {
        const response = await fetch(`${PROD_URL}/api/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://filtrosylubricantes.co'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Raw Response:', text);

        try {
            const data = JSON.parse(text);
            if (response.ok && data.signature) {
                console.log('✅ Order creation and signature generation SUCCESSFUL');
            } else {
                console.log('❌ Order creation FAILED:', data.error || 'Unknown error');
            }
        } catch (e) {
            console.log('❌ Failed to parse JSON response');
        }
    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

testOrderCreation();
