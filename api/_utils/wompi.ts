import { createHash } from 'crypto';

/**
 * Validates the Wompi event signature.
 */
export function validateWompiSignature(payload: any, signatureObj: any): boolean {
    const secret = process.env.WOMPI_EVENTS_SECRET || process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) throw new Error('WOMPI_EVENTS_SECRET missing');

    const { data, timestamp } = payload;
    const { transaction } = data;

    // Spec: concat(transaction.id + transaction.status + transaction.amount_in_cents + timestamp + secret)
    const checksum = `${transaction.id}${transaction.status}${transaction.amount_in_cents}`;
    const chain = `${checksum}${timestamp}${secret}`;

    const computed = createHash('sha256')
        .update(chain)
        .digest('hex');

    const provided = typeof signatureObj === 'string' ? signatureObj : signatureObj?.checksum;

    if (!provided) return false;

    return provided === computed;
}

/**
 * Generates the integrity signature for Wompi transactions.
 * Formula: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const secret = process.env.WOMPI_INTEGRITY_SECRET || process.env.WOMPI_EVENTS_SECRET;
    if (!secret) {
        console.warn('⚠️ WOMPI_INTEGRITY_SECRET missing. Signature generation will fail or be invalid.');
        // Don't throw here, potentially fallback or let it fail at Wompi side if critical
        // But for integrity, we usually need it.
        return '';
    }

    const chain = `${reference}${amountInCents}${currency}${secret}`;
    const hash = createHash('sha256').update(chain).digest('hex');
    return hash.toUpperCase();
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
        default: return 'on-hold'; // pending
    }
}
