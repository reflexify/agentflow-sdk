import { describe, expect, it } from 'vitest';
import { formatBytes, formatDateTime, plainText } from '../../src/model/format.js';

describe('a file size', () => {
  it('is whole bytes below a kilobyte', () => {
    expect(formatBytes(512, 'en')).toBe('512 B');
    expect(formatBytes(0, 'vi')).toBe('0 B');
  });

  it("has one decimal from a kilobyte up, in the language's decimal separator", () => {
    expect(formatBytes(1_258_291, 'vi')).toBe('1,2 MB');
    expect(formatBytes(1_258_291, 'en')).toBe('1.2 MB');
    expect(formatBytes(2048, 'en')).toBe('2.0 KB');
  });

  it('moves up a unit rather than show 1024 of the one below', () => {
    expect(formatBytes(1024 * 1024 - 1, 'en')).toBe('1.0 MB');
  });
});

describe('a date and time', () => {
  it("is day before month on a 24-hour clock, in the viewer's zone", () => {
    expect(formatDateTime('2026-10-01T02:00:00Z', 'Asia/Ho_Chi_Minh')).toBe('01/10/2026 09:00');
    expect(formatDateTime('2026-10-01T15:30:00Z', 'Asia/Ho_Chi_Minh')).toBe('01/10/2026 22:30');
    expect(formatDateTime('2026-10-01T17:05:00Z', 'Asia/Ho_Chi_Minh')).toBe('02/10/2026 00:05');
  });
});

describe('Markdown as plain text', () => {
  it('keeps the words and drops the formatting', () => {
    expect(plainText('Màn hình đăng nhập bằng email và **mã OTP**.')).toBe('Màn hình đăng nhập bằng email và mã OTP.');
    expect(plainText('# Mục tiêu\n\n- *Một* việc\n- [Tài liệu](https://example.com) và `mã`\n> **_đậm nghiêng_**')).toBe('Mục tiêu Một việc Tài liệu và mã đậm nghiêng');
    expect(plainText('5 \\* 3 và a\\_b')).toBe('5 * 3 và a_b');
    expect(plainText('Không có gì đặc biệt')).toBe('Không có gì đặc biệt');
  });
});
