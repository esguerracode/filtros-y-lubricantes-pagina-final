/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WP_URL: string
    readonly VITE_WC_CONSUMER_KEY: string
    readonly VITE_WC_CONSUMER_SECRET: string
    readonly VITE_WC_KEY: string
    readonly VITE_WC_SECRET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
