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
