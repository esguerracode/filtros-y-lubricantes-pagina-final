/**
 * ENVIRONMENT VALIDATION
 * Solo valida las variables que realmente se usan.
 */

const requiredEnvVars = [
    'VITE_WOMPI_PUBLIC_KEY',
    // WC keys removidas: ya no usamos WooCommerce
];

const missingVars: string[] = [];

// @ts-ignore
requiredEnvVars.forEach(key => {
    if (!import.meta.env[key]) {
        missingVars.push(key);
    }
});

if (missingVars.length > 0) {
    const errorMessage = `🚨 FATAL: Missing env vars: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
}

export const env = {
    WOMPI_PUBLIC_KEY: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
    WOMPI_TEST_MODE: import.meta.env.VITE_WOMPI_TEST === 'true',
    API_URL: 'https://filtrosylubricantes.co'
};

console.log('✅ Environment OK. Wompi:', env.WOMPI_PUBLIC_KEY ? 'LOADED' : 'MISSING');
