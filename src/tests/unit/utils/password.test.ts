import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password';

describe('Password Utils', () => {
  const testPassword = 'TestPassword123!';
  const weakPassword = 'weak';

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hashedPassword = await hashPassword(testPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', async () => {
      const hashedPassword = await hashPassword('');
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword(testPassword, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword('wrongpassword', hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword('', hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    it('should handle comparison with empty hash', async () => {
      const isMatch = await comparePassword(testPassword, '');
      
      expect(isMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return empty array for strong password', () => {
      const errors = validatePasswordStrength('StrongPass123!');
      
      expect(errors).toEqual([]);
    });

    it('should return error for password too short', () => {
      const errors = validatePasswordStrength('Short1!');
      
      expect(errors).toContain('Password must be at least 8 characters long');
    });

    it('should return error for password too long', () => {
      const longPassword = 'A'.repeat(120) + 'a1!';
      const errors = validatePasswordStrength(longPassword);
      
      expect(errors).toContain('Password must be less than 128 characters long');
    });

    it('should return error for password without uppercase letter', () => {
      const errors = validatePasswordStrength('lowercase123!');
      
      expect(errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should return error for password without lowercase letter', () => {
      const errors = validatePasswordStrength('UPPERCASE123!');
      
      expect(errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should return error for password without number', () => {
      const errors = validatePasswordStrength('NoNumbers!');
      
      expect(errors).toContain('Password must contain at least one number');
    });

    it('should return error for password without special character', () => {
      const errors = validatePasswordStrength('NoSpecialChars123');
      
      expect(errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for very weak password', () => {
      const errors = validatePasswordStrength('weak');
      
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Password must be at least 8 characters long');
      expect(errors).toContain('Password must contain at least one uppercase letter');
      expect(errors).toContain('Password must contain at least one number');
      expect(errors).toContain('Password must contain at least one special character');
    });

    it('should handle empty password', () => {
      const errors = validatePasswordStrength('');
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Password must be at least 8 characters long');
    });
  });
});