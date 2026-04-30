// Authentication validation utilities
// Ensures proper validation and security for authentication flows

import { validateEmail, validatePassword } from './validation';
import { sanitizeInput } from './enhanced-validation';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bloodGroup: string;
  dateOfBirth: string;
  district: string;
  location: string;
  weight: string;
  wantsToBeDonor: boolean;
  ageConfirmed: boolean;
  privacyConsent: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: Partial<RegistrationData>;
}

export function validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
  const errors: string[] = [];

  // Validate email
  if (!validateEmail(credentials.email)) {
    errors.push('Invalid email address');
  }

  // Validate password
  const passwordValidation = validatePassword(credentials.password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message || 'Invalid password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRegistrationData(data: RegistrationData): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Partial<RegistrationData> = {};

  // Validate and sanitize name
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  } else {
    sanitizedData.name = sanitizeInput(data.name);
  }

  // Validate and sanitize email
  if (!validateEmail(data.email)) {
    errors.push('Invalid email address');
  } else {
    sanitizedData.email = sanitizeInput(data.email);
  }

  // Validate and sanitize phone
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (!/^[0-9+\-\s()]+$/.test(data.phone.trim())) {
    errors.push('Phone number contains invalid characters');
  } else if (data.phone.trim().length < 10) {
    errors.push('Phone number must be at least 10 digits');
  } else {
    sanitizedData.phone = sanitizeInput(data.phone);
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message || 'Invalid password');
  }

  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Validate blood group
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validBloodGroups.includes(data.bloodGroup)) {
    errors.push('Please select a valid blood group');
  } else {
    sanitizedData.bloodGroup = data.bloodGroup;
  }

  // Validate date of birth
  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(data.dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    const finalAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate()) ? age - 1 : age;

    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth format');
    } else if (dob > now) {
      errors.push('Date of birth cannot be in the future');
    } else if (finalAge < 13) {
      errors.push('You must be at least 13 years old to register');
    } else if (finalAge > 120) {
      errors.push('Invalid date of birth');
    } else {
      sanitizedData.dateOfBirth = data.dateOfBirth;
    }
  }

  // Validate district
  if (!data.district || data.district.trim().length === 0) {
    errors.push('District is required');
  } else if (data.district.trim().length < 2) {
    errors.push('District name must be at least 2 characters');
  } else {
    sanitizedData.district = sanitizeInput(data.district);
  }

  // Validate location
  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  } else if (data.location.trim().length < 5) {
    errors.push('Please provide a more specific location');
  } else {
    sanitizedData.location = sanitizeInput(data.location);
  }

  // Validate weight
  const weightNum = parseFloat(data.weight);
  if (!data.weight || isNaN(weightNum)) {
    errors.push('Weight is required');
  } else if (weightNum < 30) {
    errors.push('Weight must be at least 30 kg');
  } else if (weightNum > 200) {
    errors.push('Weight must be less than 200 kg');
  } else {
    sanitizedData.weight = data.weight;
  }

  // Validate consent checkboxes
  if (!data.ageConfirmed) {
    errors.push('You must confirm that you are 18 years or older');
  }

  if (!data.privacyConsent) {
    errors.push('You must agree to the Privacy Policy to continue');
  }

  // Donor eligibility check
  if (data.wantsToBeDonor) {
    const dob = new Date(data.dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    const finalAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate()) ? age - 1 : age;

    if (finalAge < 18) {
      errors.push('You must be at least 18 years old to be a blood donor');
    }

    if (weightNum < 50) {
      errors.push('You must weigh at least 50 kg to be a blood donor');
    }
  }

  sanitizedData.wantsToBeDonor = data.wantsToBeDonor;
  sanitizedData.ageConfirmed = data.ageConfirmed;
  sanitizedData.privacyConsent = data.privacyConsent;

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

export function sanitizeCredentials(credentials: LoginCredentials): LoginCredentials {
  return {
    email: sanitizeInput(credentials.email),
    password: credentials.password // Don't sanitize password
  };
}

export function validateSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Basic JWT format validation (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Try to decode payload (basic validation)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function isSecurePassword(password: string): boolean {
  // Additional security checks beyond basic validation
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /letmein/i
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));

  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && !hasCommonPattern;
}

export function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}
