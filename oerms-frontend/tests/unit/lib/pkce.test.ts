import { generatePKCE } from '@/lib/pkce';

describe('PKCE Generation', () => {
  it('should generate code verifier and challenge', () => {
    const result = generatePKCE();

    expect(result.codeVerifier).toBeTruthy();
    expect(result.codeChallenge).toBeTruthy();
    expect(result.codeVerifier.length).toBeGreaterThan(43);
    expect(result.codeChallenge.length).toBeGreaterThan(0);
  });

  it('should generate different values on each call', () => {
    const r1 = generatePKCE();
    const r2 = generatePKCE();

    expect(r1.codeVerifier).not.toBe(r2.codeVerifier);
    expect(r1.codeChallenge).not.toBe(r2.codeChallenge);
  });
});
