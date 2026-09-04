import { createHash } from 'crypto';

export function hash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
