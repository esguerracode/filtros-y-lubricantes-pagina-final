// testing/diagnose_woocommerce.ts
// Diagnóstico de conectividad WooCommerce desde local

const WC_URL = process.env.VITE_WP_URL;
const KEY = process.env.VITE_WC_CONSUMER_KEY;
const SECRET = process.env.VITE_WC_CONSUMER_SECRET;

console.log('🔍 DIAGNÓSTICO WOOCOMMERCE\n');
console.log('━'.repeat(50));
console.log('URL:', WC_URL || '❌ NO CONFIGURADA');
console.log('Consumer Key:', KEY ? `✅ ${KEY.substring(0, 10)}...` : '❌ NO CONFIGURADA');
console.log('Consumer Secret:', SECRET ? `✅ ${SECRET.substring(0, 10)}...` : '❌ NO CONFIGURADA');
console.log('━'.repeat(50));

if (!WC_URL || !KEY || !SECRET) {
    console.error('\n❌ FALTAN VARIABLES DE ENTORNO');
    console.log('\nVerifica .env.local contiene:');
    console.log('  VITE_WP_URL=https://filtrosylubricantes.co');
    console.log('  VITE_WC_CONSUMER_KEY=ck_...');
    console.log('  VITE_WC_CONSUMER_SECRET=cs_...');
    process.exit(1);
}

const endpoint = `${WC_URL}/wp-json/wc/v3/products?consumer_key=${KEY}&consumer_secret=${SECRET}&per_page=3`;

console.log('\n📡 Testeando endpoint...');
console.log(`   ${endpoint.replace(KEY, 'KEY').replace(SECRET!, 'SECRET')}\n`);

(async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'WooCommerce-Diagnostic/1.0'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('━'.repeat(50));
        console.log('📊 RESPUESTA DEL SERVIDOR');
        console.log('━'.repeat(50));
        console.log('Status Code:', response.status, response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('Server:', response.headers.get('server'));
        console.log('X-Powered-By:', response.headers.get('x-powered-by'));
        console.log('━'.repeat(50));

        if (response.ok) {
            const data = await response.json();
            console.log('\n✅ ÉXITO - WooCommerce Accesible');
            console.log(`   Productos recibidos: ${data.length}`);
            console.log('\n📦 Primeros 2 productos:');
            data.slice(0, 2).forEach((p: any, i: number) => {
                console.log(`   ${i + 1}. ${p.name} - $${p.price} (Stock: ${p.stock_status})`);
            });
            console.log('\n✅ DIAGNÓSTICO: WooCommerce funciona correctamente');
        } else {
            const errorText = await response.text();
            console.error('\n❌ ERROR HTTP', response.status);
            console.error('Respuesta:', errorText.substring(0, 500));

            if (response.status === 401) {
                console.log('\n💡 CAUSA PROBABLE: Credenciales API inválidas');
                console.log('   Verifica que las claves sean correctas en WooCommerce Admin');
            } else if (response.status === 403) {
                console.log('\n💡 CAUSA PROBABLE: CORS o Firewall bloqueando');
            } else if (response.status === 404) {
                console.log('\n💡 CAUSA PROBABLE: WooCommerce no instalado o desactivado');
            }
        }

    } catch (err: any) {
        console.error('\n❌ FALLO DE CONEXIÓN');
        console.error('Error:', err.message);

        if (err.name === 'AbortError') {
            console.log('\n💡 CAUSA PROBABLE: Timeout - Servidor muy lento o inalcanzable');
        } else {
            console.log('\n💡 CAUSA PROBABLE: DNS no resuelve o red bloqueada');
        }

        console.log('\n🔧 RECOMENDACIONES:');
        console.log('   1. Verificar que filtrosylubricantes.co esté accesible');
        console.log('   2. Revisar configuración de Cloudflare');
        console.log('   3. Confirmar que WooCommerce esté activo en HostGator');
    }
})();
