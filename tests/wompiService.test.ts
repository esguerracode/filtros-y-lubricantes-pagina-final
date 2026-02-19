import { describe, it, expect } from 'vitest';
import { copToCents, generateReference, centsToCop } from '../src/services/wompiService';

describe('Wompi Service Utilities', () => {
    describe('copToCents', () => {
        it('converts standard integer amount correctly', () => {
            expect(copToCents(50000)).toBe(5000000);
        });

        it('converts float amount with cents correctly', () => {
            expect(copToCents(50000.50)).toBe(5000050);
        });

        it('handles string input correctly', () => {
            expect(copToCents('50000')).toBe(5000000);
        });

        it('rounds correctly to avoid floating point errors', () => {
            // 100.1 * 100 = 10010.000000000002 -> should be 10010
            expect(copToCents(100.1)).toBe(10010);
        });
    });

    describe('centsToCop', () => {
        it('converts cents back to COP', () => {
            expect(centsToCop(5000000)).toBe(50000);
        });

        it('converts cents with decimals back to COP', () => {
            expect(centsToCop(5000050)).toBe(50000.5);
        });
    });

    describe('generateReference', () => {
        it('generates a string', () => {
            const ref = generateReference();
            expect(typeof ref).toBe('string');
        });

        it('starts with prefix FYL-', () => {
            const ref = generateReference();
            expect(ref.startsWith('FYL-')).toBe(true);
        });

        it('generates unique references over many iterations', () => {
            const refs = new Set();
            for (let i = 0; i < 100; i++) {
                refs.add(generateReference());
            }
            expect(refs.size).toBe(100);
        });

        it('contains timestamp', () => {
            const ref = generateReference();
            // FYL-{timestamp}-{random}
            const parts = ref.split('-');
            expect(parts.length).toBe(3);

            const timestamp = parseInt(parts[1]);
            // Check if timestamp is reasonable (within last minute)
            const now = Date.now();
            expect(timestamp).toBeLessThanOrEqual(now);
            expect(timestamp).toBeGreaterThan(now - 60000);
        });
    });
});
