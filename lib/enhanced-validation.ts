import { validateEmail, validatePhone, validateAge, validateWeight } from './validation';

// Enhanced validation for form inputs
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  } else if (!/^[a-zA-Z\u0980-\u09FF\s\-\.']+$/.test(name.trim())) {
    errors.push('Name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateTitle(title: string): ValidationResult {
  const errors: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  } else if (/<[^>]*>/.test(title)) {
    errors.push('Title cannot contain HTML tags');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateDescription(description: string): ValidationResult {
  const errors: string[] = [];
  
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  } else if (description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (description.trim().length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBloodGroup(bloodGroup: string): ValidationResult {
  const errors: string[] = [];
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  if (!bloodGroup) {
    errors.push('Blood group is required');
  } else if (!validGroups.includes(bloodGroup)) {
    errors.push('Invalid blood group');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateDistrict(district: string): ValidationResult {
  const errors: string[] = [];
  
  if (!district || district.trim().length === 0) {
    errors.push('District is required');
  } else if (!/^[a-zA-Z\s\-]+$/.test(district.trim())) {
    errors.push('Invalid district format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateArea(area: string): ValidationResult {
  const errors: string[] = [];
  
  if (!area || area.trim().length === 0) {
    errors.push('Area is required');
  } else if (area.trim().length < 2) {
    errors.push('Area must be at least 2 characters long');
  } else if (area.trim().length > 100) {
    errors.push('Area must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePasswordStrength(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateDateOfBirth(dateOfBirth: string): ValidationResult {
  const errors: string[] = [];
  
  if (!dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date format');
    } else if (dob > now) {
      errors.push('Date of birth cannot be in the future');
    } else if (age < 13) {
      errors.push('You must be at least 13 years old');
    } else if (age > 120) {
      errors.push('Invalid date of birth');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRegistrationForm(formData: any): ValidationResult {
  const allErrors: string[] = [];
  
  // Validate name
  const nameValidation = validateName(formData.name);
  allErrors.push(...nameValidation.errors);
  
  // Validate email
  if (!validateEmail(formData.email)) {
    allErrors.push('Invalid email address');
  }
  
  // Validate phone
  if (!validatePhone(formData.phone)) {
    allErrors.push('Invalid phone number');
  }
  
  // Validate blood group
  const bloodGroupValidation = validateBloodGroup(formData.bloodGroup);
  allErrors.push(...bloodGroupValidation.errors);
  
  // Validate date of birth
  const dobValidation = validateDateOfBirth(formData.dateOfBirth);
  allErrors.push(...dobValidation.errors);
  
  // Validate district
  const districtValidation = validateDistrict(formData.district);
  allErrors.push(...districtValidation.errors);
  
  // Validate area
  const areaValidation = validateArea(formData.area);
  allErrors.push(...areaValidation.errors);
  
  // Validate weight
  if (!validateWeight(formData.weight)) {
    allErrors.push('Invalid weight');
  }
  
  // Validate password
  const passwordValidation = validatePasswordStrength(formData.password);
  allErrors.push(...passwordValidation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .substring(0, 1000); // Limit length
}

export function validateAndSanitizeInput(input: string, fieldName: string): ValidationResult {
  const sanitized = sanitizeInput(input);
  const errors: string[] = [];
  
  if (sanitized.length === 0) {
    errors.push(`${fieldName} is required`);
  } else if (sanitized.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  } else if (sanitized.length > 500) {
    errors.push(`${fieldName} is too long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}
