import crypto from 'crypto';

export function validateWompiSignature(payload: any, signature: string): boolean {
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (!secret) throw new Error('WOMPI_EVENTS_SECRET missing');

    const { data, timestamp } = payload;
    const { transaction } = data;

    // Concatenate per Wompi Spec
    // timestamp + id + status + amount_in_cents
    const chain = `${timestamp}${transaction.id}${transaction.status}${transaction.amount_in_cents}`;

    const computed = crypto
        .createHmac('sha256', secret)
        .update(chain)
        .digest('hex');

    const a = Buffer.from(signature);
    const b = Buffer.from(computed);

    if (a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(a, b);
}

/**
 * Generates the integrity signature for Wompi transactions.
 * Formula: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const secret = process.env.WOMPI_INTEGRITY_SECRET || process.env.WOMPI_EVENTS_SECRET;
    if (!secret) {
        console.warn('⚠️ WOMPI_INTEGRITY_SECRET missing. Signature generation will fail or be invalid.');
        return '';
    }

    const chain = `${reference}${amountInCents}${currency}${secret}`;
    const hash = crypto.createHash('sha256').update(chain).digest('hex');
    return hash;
}

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
