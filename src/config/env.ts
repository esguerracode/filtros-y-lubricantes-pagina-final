/**
 * STRICT ENVIRONMENT VALIDATION
 * 
 * This file must be imported at the very top of the application entry point (main.tsx).
 * It ensures that the application crashes immediately if critical configuration is missing,
 * preventing runtime errors later in the payment flow.
 */

const requiredEnvVars = [
    'VITE_WOMPI_PUBLIC_KEY',
    'VITE_WC_CONSUMER_KEY',
    'VITE_WC_CONSUMER_SECRET',
    // Note: Server-side secrets (WOMPI_EVENTS_SECRET, KV_URL) are checked in Vercel Functions, 
    // not here in the client bundle to avoid exposing them.
];

const missingVars: string[] = [];

requiredEnvVars.forEach(key => {
    if (!import.meta.env[key]) {
        missingVars.push(key);
    }
});

if (missingVars.length > 0) {
    const errorMessage = `
    🚨 FATAL ERROR: Missing Environment Variables 🚨
    ------------------------------------------------
    The following required variables are missing in .env.local:
    ${missingVars.map(v => `- ${v}`).join('\n')}
    
    The application cannot start pending these configurations.
    `;

    console.error(errorMessage);

    // Stop execution by throwing error
    throw new Error(errorMessage);
}

// Type-safe export of validated config
export const env = {
    WOMPI_PUBLIC_KEY: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
    WOMPI_TEST_MODE: import.meta.env.VITE_WOMPI_TEST === 'true',
    WC_CONSUMER_KEY: import.meta.env.VITE_WC_CONSUMER_KEY,
    WC_CONSUMER_SECRET: import.meta.env.VITE_WC_CONSUMER_SECRET,
    API_URL: import.meta.env.VITE_WP_URL || 'https://filtrosylubricantes.co'
};

console.log('✅ Environment configuration validated.');
