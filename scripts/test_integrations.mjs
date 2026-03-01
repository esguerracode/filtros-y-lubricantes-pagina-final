import https from 'https';

const API_BASE = 'https://www.filtrosylubricantes.co/api';

function postJSON(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: 'www.filtrosylubricantes.co',
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (d) => responseData += d);
            res.on('end', () => resolve({ status: res.statusCode, data: responseData }));
        });

        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('--- EMPEZANDO PRUEBAS DE INTEGRACIÓN SIN PAGO ---');

    // 1. Prueba de Contacto -> Telegram
    console.log('\n[1/2] Probando Formulario de Contacto a Telegram...');
    try {
        const contactRes = await postJSON('/api/contact/submit', {
            nombre: 'Antigravity AI (Prueba)',
            email: 'filtrosylubricantesdelllano@gmail.com',
            telefono: '3000000000',
            mensaje: '🚀 Hola equipo! Esta es una prueba simulada generada por Antigravity para verificar que los mensajes del formulario están llegando correctamente a este chat sin errores.'
        });
        console.log(`✅ Resultado Contacto (Status ${contactRes.status}):`, contactRes.data);
    } catch (e) {
        console.error('❌ Error Contacto:', e.message);
    }

    // 2. Prueba de Checkout -> Telegram & Email (Brevo)
    console.log('\n[2/2] Probando Confirmación de Orden (Telegram y Brevo)...');
    try {
        const orderRes = await postJSON('/api/orders/create', {
            items: [
                { name: 'Filtro Aire Motor (Simulación Prueba)', price: 1000, quantity: 1 }
            ],
            customer: {
                fullName: 'Antigravity AI Test Cliente',
                email: 'filtrosylubricantesdelllano@gmail.com', // Replace with Daniel's email.
                phoneNumber: '3000000000',
                city: 'Puerto Gaitán'
            }
        });
        console.log(`✅ Resultado Orden (Status ${orderRes.status}):`, orderRes.data);
    } catch (e) {
        console.error('❌ Error Orden:', e.message);
    }

    console.log('\n--- PRUEBAS FINALIZADAS ---');
}

runTests();
