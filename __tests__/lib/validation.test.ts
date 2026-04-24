import { validateEmail, validatePassword, validatePhone, validateAge, validateWeight, sanitizeInput } from '@/lib/validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    test('accepts valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.bd')).toBe(true)
      expect(validateEmail('test+tag@example.co.uk')).toBe(true)
    })

    test('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    test('validates strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.valid).toBe(true)
    })

    test('rejects weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('at least 8 characters')
    })

    test('requires uppercase, lowercase, number, and special char', () => {
      expect(validatePassword('password123').valid).toBe(false)
      expect(validatePassword('PASSWORD123').valid).toBe(false)
      expect(validatePassword('Password!').valid).toBe(false)
    })
  })

  describe('validatePhone', () => {
    test('accepts valid phone numbers (10+ digits)', () => {
      expect(validatePhone('01712345678')).toBe(true)
      expect(validatePhone('01812345678')).toBe(true)
      expect(validatePhone('01912345678')).toBe(true)
      expect(validatePhone('01312345678')).toBe(true)
      expect(validatePhone('01412345678')).toBe(true)
      expect(validatePhone('01512345678')).toBe(true)
      expect(validatePhone('01612345678')).toBe(true)
      expect(validatePhone('0171234567')).toBe(true) // 10 digits is minimum
    })

    test('rejects invalid phone numbers', () => {
      expect(validatePhone('017123456')).toBe(false) // Too short (9 digits)
      expect(validatePhone('0171234567a')).toBe(false) // Has letter
      expect(validatePhone('')).toBe(false) // Empty
      expect(validatePhone('abc')).toBe(false) // Letters only
    })
  })

  describe('validateAge', () => {
    test('accepts valid ages', () => {
      expect(validateAge(18)).toBe(true)
      expect(validateAge(25)).toBe(true)
      expect(validateAge(65)).toBe(true)
    })

    test('rejects invalid ages', () => {
      expect(validateAge(12)).toBe(false) // Too young
      expect(validateAge(101)).toBe(false) // Too old
      expect(validateAge(-5)).toBe(false) // Negative
    })
  })

  describe('validateWeight', () => {
    test('accepts valid weights', () => {
      expect(validateWeight(50)).toBe(true)
      expect(validateWeight(70)).toBe(true)
      expect(validateWeight(100)).toBe(true)
    })

    test('rejects invalid weights', () => {
      expect(validateWeight(29)).toBe(false) // Too light
      expect(validateWeight(201)).toBe(false) // Too heavy
    })
  })

  describe('sanitizeInput', () => {
    test('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).not.toContain('<script>')
      expect(sanitizeInput('<div>content</div>')).not.toContain('<div>')
    })

    test('removes javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:')
    })

    test('removes event handlers', () => {
      expect(sanitizeInput('<img onerror=alert(1)>')).not.toContain('onerror')
      expect(sanitizeInput('<a onclick=alert(1)>')).not.toContain('onclick')
    })

    test('keeps safe text', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World')
      expect(sanitizeInput('123 Main St.')).toBe('123 Main St.')
    })
  })
})
