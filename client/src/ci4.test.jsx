import { describe, it, expect } from 'vitest';

describe('Brews and Views - Security Check', () => {
  
  it('should intentionally fail to test the CI pipeline', () => {
    const coffeePrice = 150;
    const payment = 100;

    // This will FAIL because 100 is not 150.
    // In a real app, this would prevent a "short payment" bug from going live.
    expect(payment).toBe(coffeePrice);
  });

  it('should fail a simple math check', () => {
    // This is the fastest way to trigger a Red X
    expect(1 + 1).toBe(3);
  });
});