import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateWompiSignature } from '../api/_utils/wompi';
import crypto from 'crypto';

describe('Wompi Signature Validation (Security)', () => {
    const SECRET = 'test_secret_123';
    let originalEnv: any;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv, WOMPI_EVENTS_SECRET: SECRET };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const generateSignature = (data: any, timestamp: number) => {
        const chain = `${timestamp}${data.transaction.id}${data.transaction.status}${data.transaction.amount_in_cents}`;
        return crypto.createHmac('sha256', SECRET).update(chain).digest('hex');
    };

    it('returns true for a valid signature', () => {
        const payload = {
            data: {
                transaction: {
                    id: 'tx_valid',
                    status: 'APPROVED',
                    amount_in_cents: 5000000 // $50.000
                }
            },
            timestamp: 1678900000
        };
        const signature = generateSignature(payload.data, payload.timestamp);

        expect(validateWompiSignature(payload, signature)).toBe(true);
    });

    it('returns false for an invalid signature (wrong secret)', () => {
        const payload = {
            data: {
                transaction: {
                    id: 'tx_invalid',
                    status: 'APPROVED',
                    amount_in_cents: 5000000
                }
            },
            timestamp: 1678900000
        };
        const signature = 'invalid_hash_string';

        expect(validateWompiSignature(payload, signature)).toBe(false);
    });

    it('returns false for a tampered payload (amount changed)', () => {
        const payload = {
            data: {
                transaction: {
                    id: 'tx_tampered',
                    status: 'APPROVED',
                    amount_in_cents: 5000000 // Original amount
                }
            },
            timestamp: 1678900000
        };
        const signature = generateSignature(payload.data, payload.timestamp);

        // Attacker changes amount to $1.000
        payload.data.transaction.amount_in_cents = 100000;

        expect(validateWompiSignature(payload, signature)).toBe(false);
    });

    it('returns false for a tampered payload (status changed)', () => {
        const payload = {
            data: {
                transaction: {
                    id: 'tx_tampered_status',
                    status: 'DECLINED', // Original status
                    amount_in_cents: 5000000
                }
            },
            timestamp: 1678900000
        };
        const signature = generateSignature(payload.data, payload.timestamp);

        // Attacker tries to force APPROVE
        payload.data.transaction.status = 'APPROVED';

        expect(validateWompiSignature(payload, signature)).toBe(false);
    });

    it('throws error if WOMPI_EVENTS_SECRET is missing', () => {
        delete process.env.WOMPI_EVENTS_SECRET;

        const payload = { data: { transaction: {} }, timestamp: 123 };
        expect(() => validateWompiSignature(payload, 'sig')).toThrow('WOMPI_EVENTS_SECRET missing');
    });
});
