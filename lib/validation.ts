// Input validation utilities

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Allow digits, spaces, +, -, ()
  const phoneRegex = /^[\d\s\-\(\)+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long' };
  }
  return { valid: true, message: '' };
}

export function validateAge(age: number): boolean {
  return age >= 13 && age <= 100;
}

export function validateWeight(weight: number): boolean {
  return weight >= 30 && weight <= 200;
}
