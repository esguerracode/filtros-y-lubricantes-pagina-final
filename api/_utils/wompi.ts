import { createHash } from 'crypto';

/**
 * Validates the Wompi event signature.
 * Spec: SHA256(transaction.id + transaction.status + transaction.amount_in_cents + timestamp + secret)
 * Result must be lowercase hex - Wompi spec
 */
export function validateWompiSignature(payload: any): boolean {
    try {
        const secret = process.env.WOMPI_EVENTS_SECRET;
        if (!secret) throw new Error('WOMPI_EVENTS_SECRET missing');

        const { checksum, properties } = payload.signature;
        const timestamp = payload.timestamp;

        const chain = properties
            .map((prop: string) => {
                // Navegar por el objeto (ej: "data.transaction.id")
                return prop.split('.').reduce((obj: any, key: string) => obj?.[key], payload);
            })
            .join('') + timestamp + secret;

        const hash = createHash('sha256')
            .update(chain)
            .digest('hex');

        return hash === checksum;
    } catch (e) {
        console.error('Signature validation error:', e);
        return false;
    }
}

/**
 * Generates the integrity signature for Wompi transactions.
 * Formula: SHA256(reference + amountInCents + currency + integritySecret)
 * IMPORTANT: Must be lowercase hex - Wompi rejects uppercase
 * Reference: https://docs.wompi.co
 */
export function generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const secret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) { console.error('WOMPI_INTEGRITY_SECRET missing'); return ''; }

    const chain = `${reference}${amountInCents}${currency}${secret}`;
    // CRITICAL: digest('hex') returns lowercase - do NOT call toUpperCase()
    // Wompi validates against lowercase hex checksum
    const hash = createHash('sha256').update(chain).digest('hex');
    return hash;
}

/**
 * Converts a numeric or string amount to cents (integer).
 */
export function copToCents(amount: number | string): number {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return Math.round(val * 100);
}

export function mapWompiStatus(status: string): string {
    switch (status) {
        case 'APPROVED': return 'processing';
        case 'DECLINED': return 'failed';
        case 'VOIDED': return 'cancelled';
        case 'ERROR': return 'failed';
        default: return 'on-hold';
    }
}
