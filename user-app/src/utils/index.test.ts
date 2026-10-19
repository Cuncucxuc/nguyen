import { describe, it, expect } from 'vitest';
import {
  normalizeVietnamese,
  formatCurrency,
  getAgeRatingInfo,
  getSeatLabel,
  getSeatTypeName,
  formatDateLabel,
} from './index';

describe('Shared Utilities Test Suite', () => {
  describe('normalizeVietnamese', () => {
    it('should normalize accented Vietnamese text to lowercase ASCII', () => {
      expect(normalizeVietnamese('Lật Mặt 7: Một Điều Ước')).toBe('lat mat 7: mot dieu uoc');
      expect(normalizeVietnamese('Đất Rừng Phương Nam')).toBe('dat rung phuong nam');
      expect(normalizeVietnamese('Trần Hữu Tấn')).toBe('tran huu tan');
    });

    it('should handle special Vietnamese letter đ and Đ', () => {
      expect(normalizeVietnamese('Điện Ảnh Đỉnh Cao')).toBe('dien anh dinh cao');
      expect(normalizeVietnamese('đường')).toBe('duong');
    });

    it('should trim whitespace and handle empty strings', () => {
      expect(normalizeVietnamese('   Mai   ')).toBe('mai');
      expect(normalizeVietnamese('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers into Vietnamese Dong with symbol', () => {
      expect(formatCurrency(85000)).toBe('85.000đ');
      expect(formatCurrency(1200000)).toBe('1.200.000đ');
      expect(formatCurrency(0)).toBe('0đ');
    });
  });

  describe('getAgeRatingInfo', () => {
    it('should return correct badge color and description for T18', () => {
      const info = getAgeRatingInfo('T18');
      expect(info.bg).toContain('bg-red-600');
      expect(info.label).toBe('T18');
      expect(info.desc).toContain('18 tuổi');
    });

    it('should return correct badge color and description for T16', () => {
      const info = getAgeRatingInfo('T16');
      expect(info.bg).toContain('bg-orange-500');
      expect(info.label).toBe('T16');
      expect(info.desc).toContain('16 tuổi');
    });

    it('should return correct badge color and description for T13', () => {
      const info = getAgeRatingInfo('T13');
      expect(info.bg).toContain('bg-amber-500');
      expect(info.label).toBe('T13');
      expect(info.desc).toContain('13 tuổi');
    });

    it('should return default P for general audience', () => {
      const infoP = getAgeRatingInfo('P');
      expect(infoP.bg).toContain('bg-emerald-600');
      expect(infoP.label).toBe('P');

      const infoUnknown = getAgeRatingInfo('');
      expect(infoUnknown.label).toBe('P');
    });
  });

  describe('getSeatLabel', () => {
    it('should format standard and VIP seat labels with padded column', () => {
      expect(getSeatLabel({ row: 'F', col: 5, type: 'standard' })).toBe('F05');
      expect(getSeatLabel({ row: 'E', col: 12, type: 'vip' })).toBe('E12');
    });

    it('should format couple seat labels spanning two consecutive columns', () => {
      // Couple col 1 spans cols 1-2
      expect(getSeatLabel({ row: 'A', col: 1, type: 'couple' })).toBe('A01-A02');
      // Couple col 3 spans cols 5-6
      expect(getSeatLabel({ row: 'B', col: 3, type: 'couple' })).toBe('B05-B06');
    });
  });

  describe('getSeatTypeName', () => {
    it('should return Vietnamese name for seat types', () => {
      expect(getSeatTypeName('couple')).toBe('Ghế Đôi');
      expect(getSeatTypeName('vip')).toBe('Ghế VIP');
      expect(getSeatTypeName('standard')).toBe('Ghế Thường');
      expect(getSeatTypeName(undefined)).toBe('Ghế Thường');
    });
  });

  describe('formatDateLabel', () => {
    it('should correctly format YYYY-MM-DD date string', () => {
      const result = formatDateLabel('2026-10-19');
      expect(result.dateNum).toBe('19/10');
      expect(result.dayOfWeek).toBeDefined();
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDateLabel('invalid-date');
      expect(result.dateNum).toBe('invalid-date');
    });
  });
});
