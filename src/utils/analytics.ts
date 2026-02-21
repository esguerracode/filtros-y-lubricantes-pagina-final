declare global {
    interface Window {
        dataLayer: any[];
        fbq: any;
    }
}

// TODO PRODUCCIÓN: reemplazar G-PENDIENTE con ID real de GA4
export const GTM_ID = 'G-PENDIENTE'; // To be replaced by User/Env
export const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

// Helper to safely access dataLayer
export const gtag = (...args: any[]) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
};

// Helper to safely access fbq
export const fbq = (...args: any[]) => {
    if (window.fbq) {
        window.fbq(...args);
    } else {
        console.warn('Meta Pixel not initialized');
    }
};

// Standardized Events
export const trackPageView = () => {
    gtag('event', 'page_view');
    fbq('track', 'PageView');
};

export const trackViewContent = (product: { id: number | string; name: string; price: number; type: string }) => {
    gtag('event', 'view_item', {
        currency: 'COP',
        value: product.price,
        items: [{
            item_id: String(product.id),
            item_name: product.name,
            price: product.price,
            item_category: product.type
        }]
    });

    fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [String(product.id)],
        content_type: 'product',
        value: product.price,
        currency: 'COP'
    });
};

export const trackAddToCart = (product: { id: number | string; name: string; price: number; type?: string; quantity: number }) => {
    gtag('event', 'add_to_cart', {
        currency: 'COP',
        value: product.price * product.quantity,
        items: [{
            item_id: String(product.id),
            item_name: product.name,
            price: product.price,
            quantity: product.quantity
        }]
    });

    fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [String(product.id)],
        content_type: 'product',
        value: product.price * product.quantity,
        currency: 'COP'
    });
};

export const trackInitiateCheckout = (products: { id: number | string; name: string; price: number; quantity: number }[], totalValue: number) => {
    gtag('event', 'begin_checkout', {
        currency: 'COP',
        value: totalValue,
        items: products.map(p => ({
            item_id: String(p.id),
            item_name: p.name,
            price: p.price,
            quantity: p.quantity
        }))
    });

    fbq('track', 'InitiateCheckout', {
        content_ids: products.map(p => String(p.id)),
        content_type: 'product',
        value: totalValue,
        currency: 'COP',
        num_items: products.reduce((acc, p) => acc + p.quantity, 0)
    });
};

export const trackPurchase = (transactionId: string, value: number, currency: string = 'COP') => {
    gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency
    });

    fbq('track', 'Purchase', {
        value: value,
        currency: currency,
        content_type: 'product'
    });
};
