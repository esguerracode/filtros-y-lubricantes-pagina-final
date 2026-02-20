import { createHash } from 'crypto';

/**
 * Validates the Wompi event signature.
 * Spec: SHA256(transaction.id + transaction.status + transaction.amount_in_cents + timestamp + secret)
 * Result must be lowercase hex - Wompi spec
 */
export function validateWompiSignature(payload: any, signatureObj: any): boolean {
    const secret = process.env.WOMPI_EVENTS_SECRET || process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) throw new Error('WOMPI_EVENTS_SECRET missing');

    const { data, timestamp } = payload;
    const { transaction } = data;

    const checksum = `${transaction.id}${transaction.status}${transaction.amount_in_cents}`;
    const chain = `${checksum}${timestamp}${secret}`;

    const computed = createHash('sha256')
        .update(chain)
        .digest('hex'); // lowercase hex - Wompi official spec

    const provided = typeof signatureObj === 'string' ? signatureObj : signatureObj?.checksum;

    if (!provided) return false;
    return provided.toLowerCase() === computed;
}

/**
 * Generates the integrity signature for Wompi transactions.
 * Formula: SHA256(reference + amountInCents + currency + integritySecret)
 * IMPORTANT: Must be lowercase hex - Wompi rejects uppercase
 * Reference: https://docs.wompi.co
 */
export function generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const secret = process.env.WOMPI_INTEGRITY_SECRET || process.env.WOMPI_EVENTS_SECRET;
    if (!secret) {
        console.error('WOMPI_INTEGRITY_SECRET is missing. Cannot generate valid integrity signature.');
        // Con la verificación en create.ts, esto devolverá '' y disparará el error 500
        return '';
    }

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
