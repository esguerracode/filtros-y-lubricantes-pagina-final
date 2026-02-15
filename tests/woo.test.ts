import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('WooCommerce Utils', () => {
    let mockPut: any;
    let woo: any;

    beforeEach(async () => {
        vi.resetModules(); // Clear module cache to reset 'apiInstance'
        vi.clearAllMocks();

        // Set env vars
        process.env.VITE_WP_URL = 'http://example.com';
        process.env.WC_CONSUMER_KEY = 'ck_123';
        process.env.WC_CONSUMER_SECRET = 'cs_123';

        mockPut = vi.fn();

        // Mock axios instance
        (axios.create as any).mockReturnValue({
            get: vi.fn(),
            post: vi.fn(),
            put: mockPut
        });

        // Mock setTimeout
        vi.spyOn(global, 'setTimeout').mockImplementation((cb: any) => cb() as any);

        // Dynamic import to get fresh module
        woo = await import('../api/_utils/woo');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete process.env.VITE_WP_URL;
        delete process.env.WC_CONSUMER_KEY;
        delete process.env.WC_CONSUMER_SECRET;
    });

    it('updateOrderWithRetry retries on failure', async () => {
        mockPut
            .mockRejectedValueOnce(new Error('Net Error 1'))
            .mockRejectedValueOnce(new Error('Net Error 2'))
            .mockResolvedValue({ data: { id: 123, status: 'processing' } });

        const result = await woo.updateOrderWithRetry(123, { status: 'processing' });

        expect(mockPut).toHaveBeenCalledTimes(3);
        expect(result).toEqual({ id: 123, status: 'processing' });
    });

    it('updateOrderWithRetry fails after max retries', async () => {
        mockPut.mockRejectedValue(new Error('Final Network Error'));

        await expect(woo.updateOrderWithRetry(123, {}, 3)).rejects.toThrow('Final Network Error');
        expect(mockPut).toHaveBeenCalledTimes(3);
    });
});
