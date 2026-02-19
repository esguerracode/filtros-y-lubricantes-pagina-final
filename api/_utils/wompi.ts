import { createHash } from 'crypto';

export function copToCents(amount: string | number): number {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(numericAmount * 100);
}

export function generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!integritySecret) {
    throw new Error('WOMPI_INTEGRITY_SECRET is not defined');
  }
  const chain = `${reference}${amountInCents}${currency}${integritySecret}`;
  const hash = createHash('sha256').update(chain).digest('hex');
  return hash.toUpperCase(); // Wompi expects uppercase
}
