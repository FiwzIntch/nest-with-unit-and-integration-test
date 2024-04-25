import { beforeEach, describe, expect, it, vi } from 'vitest';
import { transformIntOptional } from './base';

vi.mock('@app/util/password.util');

vi.mock('bcrypt', () => ({
  compare: vi.fn().mockResolvedValue(true),
}));

describe('transformIntOptional', () => {
  beforeEach(async () => {});

  it('should be transform number string to number', () => {
    expect(transformIntOptional({ value: '1' } as any)).toBe(1);
    expect(transformIntOptional({ value: '01' } as any)).toBe(1);
    expect(transformIntOptional({ value: '1.49' } as any)).toBe(1);
    expect(transformIntOptional({ value: '-10' } as any)).toBe(-10);
    expect(transformIntOptional({ value: '0' } as any)).toBe(0);
    expect(transformIntOptional({ value: '13dff0' } as any)).toBe(13);
  });

  it('should be transform null,undefined to undefined', () => {
    expect(transformIntOptional({ value: undefined } as any)).toBe(undefined);
    expect(transformIntOptional({ value: 'undefined' } as any)).toBe(undefined);
    expect(transformIntOptional({ value: 'null' } as any)).toBe(undefined);
  });

  it('should be transform string to undefined', () => {
    expect(transformIntOptional({ value: 'dsfdef' } as any)).toBe(undefined);
    expect(transformIntOptional({ value: 'xx32' } as any)).toBe(undefined);
  });

  it('should be transform object or array to undefined', () => {
    expect(transformIntOptional({ value: [1, 3] } as any)).toBe(undefined);
    expect(transformIntOptional({ value: { a: 1, b: 2 } } as any)).toBe(
      undefined,
    );
  });
});
