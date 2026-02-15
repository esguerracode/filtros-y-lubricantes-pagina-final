import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import wompiWebhook from '../api/webhooks/wompi';
import { kv } from '@vercel/kv';
import crypto from 'crypto';
import { getOrderByReference, updateOrderWithRetry } from '../api/_utils/woo';

// Mocks
vi.mock('@vercel/kv', () => ({
    kv: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn()
    }
}));

vi.mock('../api/_utils/woo', () => ({
    getOrderByReference: vi.fn(),
    updateOrderWithRetry: vi.fn()
}));

describe('Wompi Webhook Integration (Rigorous)', () => {
    const SECRET = 'test_secret_integration';
    let req: any;
    let res: any;
    let originalEnv: any;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv, WOMPI_EVENTS_SECRET: SECRET };

        vi.clearAllMocks();

        req = {
            method: 'POST',
            headers: {},
            body: {}
        };

        res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn()
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    const generateSignature = (payload: any) => {
        const { data, timestamp } = payload;
        const { transaction } = data;
        const chain = `${timestamp}${transaction.id}${transaction.status}${transaction.amount_in_cents}`;
        return crypto.createHmac('sha256', SECRET).update(chain).digest('hex');
    };

    const createPayload = (id: string, ref: string, status: string, amount: number) => ({
        data: {
            transaction: {
                id,
                reference: ref,
                status,
                amount_in_cents: amount,
                payment_method_type: 'CARD'
            }
        },
        timestamp: 1678900000,
        event: 'transaction.updated'
    });

    it('Happy Path: APPROVED status updates order to processing', async () => {
        const payload = createPayload('tx_happy', 'WC-100', 'APPROVED', 5000000);
        const signature = generateSignature(payload);

        req.headers['x-event-signature'] = signature;
        req.body = payload;

        // Mock Woo Order
        (getOrderByReference as any).mockResolvedValue({ id: 100, total: 50000 });

        // Mock KV: Not processed, Lock acquired
        (kv.get as any).mockResolvedValue(null);
        (kv.set as any).mockResolvedValue(1);

        await wompiWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('Updated');

        // Verify Order Update
        expect(updateOrderWithRetry).toHaveBeenCalledWith(100, expect.objectContaining({
            status: 'processing',
            transaction_id: 'tx_happy'
        }));
    });

    it('Failure Path: DECLINED status updates order to failed', async () => {
        const payload = createPayload('tx_declined', 'WC-101', 'DECLINED', 5000000);
        const signature = generateSignature(payload);

        req.headers['x-event-signature'] = signature;
        req.body = payload;

        (getOrderByReference as any).mockResolvedValue({ id: 101, total: 50000 });
        (kv.get as any).mockResolvedValue(null);
        (kv.set as any).mockResolvedValue(1);

        await wompiWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(updateOrderWithRetry).toHaveBeenCalledWith(101, expect.objectContaining({
            status: 'failed'
        }));
    });

    it('Idempotency: Concurrent requests handled correctly', async () => {
        const payload = createPayload('tx_concurrent', 'WC-102', 'APPROVED', 5000000);
        const signature = generateSignature(payload);

        req.headers['x-event-signature'] = signature;
        req.body = payload;

        // Simulate ALREADY PROCESSING (Lock cannot be acquired)
        (kv.get as any).mockResolvedValue(null); // Not finished
        (kv.set as any).mockResolvedValue(0); // Failed to acquire nx lock

        await wompiWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('Processing in parallel');
        expect(updateOrderWithRetry).not.toHaveBeenCalled();
    });

    it('Idempotency: Already processed request ignored', async () => {
        const payload = createPayload('tx_processed', 'WC-103', 'APPROVED', 5000000);
        const signature = generateSignature(payload);

        req.headers['x-event-signature'] = signature;
        req.body = payload;

        // Simulate ALREADY PROCESSED
        (kv.get as any).mockResolvedValue('1');

        await wompiWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('Already Processed');
        expect(updateOrderWithRetry).not.toHaveBeenCalled();
    });

    it('Error Handling: Throws 500 if WooCommerce unavailable', async () => {
        const payload = createPayload('tx_error', 'WC-104', 'APPROVED', 5000000);
        const signature = generateSignature(payload);

        req.headers['x-event-signature'] = signature;
        req.body = payload;

        (getOrderByReference as any).mockResolvedValue({ id: 104, total: 50000 });
        (kv.get as any).mockResolvedValue(null);
        (kv.set as any).mockResolvedValue(1);
        (updateOrderWithRetry as any).mockRejectedValue(new Error('Woo is down'));

        await wompiWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(kv.del).toHaveBeenCalledWith('wompi:lock:tx_error'); // Ensure lock released
    });
});
