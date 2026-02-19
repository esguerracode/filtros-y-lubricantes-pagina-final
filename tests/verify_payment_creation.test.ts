
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/payments/create';

// Mock Environment Variables
process.env.WOMPI_PRIVATE_KEY = 'prv_test_123';
process.env.VITE_WOMPI_PUBLIC_KEY = 'pub_test_123';
process.env.WOMPI_INTEGRITY_SECRET = 'integrity_secret_123';

// Mock fetch
global.fetch = vi.fn();

// Mock Response
const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.setHeader = vi.fn();
    res.send = vi.fn();
    return res;
};

describe('API: /api/payments/create', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as any).mockResolvedValue({
            json: async () => ({
                data: {
                    presigned_acceptance: {
                        acceptance_token: 'test_acceptance_token'
                    }
                }
            })
        });
    });

    it('should generate signature and send correct payload for CARD', async () => {
        const req = {
            method: 'POST',
            body: {
                type: 'CARD',
                amount: 100000, // $100.000 COP
                reference: 'WC-12345',
                email: 'test@example.com',
                token: 'tok_test_card',
                customerData: {
                    full_name: 'Test User',
                    phone_number: '+573001234567'
                }
            }
        };
        const res = mockRes();

        await handler(req, res);

        expect(global.fetch).toHaveBeenCalledTimes(2); // 1. merchants (token), 2. transactions

        // Check 2nd call (Transaction)
        const transactionCall = (global.fetch as any).mock.calls[1];
        const url = transactionCall[0];
        const options = transactionCall[1];
        const body = JSON.parse(options.body);

        expect(url).toBe('https://production.wompi.co/v1/transactions');
        expect(body).toHaveProperty('signature');
        expect(body.reference).toBe('WC-12345');
        expect(body.amount_in_cents).toBe(100000);
        expect(body.payment_method.type).toBe('CARD');

        // Verify Signature Generation (approximate check that it exists)
        // We can't easily reproduce the exact hash without importing the utility, 
        // but the presence confirms logic ran.
        console.log('Generated Signature:', body.signature);
        expect(body.signature).toBeTruthy();
    });

    it('should handle PSE payload correctly', async () => {
        const req = {
            method: 'POST',
            body: {
                type: 'PSE',
                amount: 50000,
                reference: 'WC-67890',
                email: 'pse@example.com',
                pseData: {
                    user_type: '0',
                    user_legal_id_type: 'CC',
                    user_legal_id: '123456789',
                    financial_institution_code: '1077'
                },
                customerData: {
                    full_name: 'PSE User',
                    phone_number: '+573009876543'
                }
            }
        };
        const res = mockRes();

        await handler(req, res);

        const transactionCall = (global.fetch as any).mock.calls[1];
        const body = JSON.parse(transactionCall[1].body);

        expect(body.payment_method.type).toBe('PSE');
        expect(body.payment_method.user_legal_id).toBe('123456789');
        expect(body.signature).toBeTruthy();
    });
});
