import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email address');

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation schema
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\u0980-\u09FF]+$/, 'Name can only contain letters and spaces');

// Phone number validation schema (Bangladesh format)
export const phoneSchema = z.string()
  .min(11, 'Phone number must be at least 11 digits')
  .max(14, 'Phone number must be at most 14 digits')
  .regex(/^(?:\+880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number');

// Blood group validation schema
export const bloodGroupSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
  errorMap: () => ({ message: 'Invalid blood group' })
});

// District validation schema
export const districtSchema = z.string()
  .min(2, 'District is required')
  .max(50, 'District name is too long');

// Age validation schema
export const ageSchema = z.number()
  .min(18, 'Must be at least 18 years old')
  .max(65, 'Must be less than 65 years old');

// Weight validation schema (kg)
export const weightSchema = z.number()
  .min(50, 'Must be at least 50 kg')
  .max(150, 'Must be less than 150 kg');

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Registration validation schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
  bloodGroup: bloodGroupSchema,
  district: districtSchema,
  age: ageSchema.optional(),
  weight: weightSchema.optional()
});

// Blood request validation schema
export const bloodRequestSchema = z.object({
  patientName: nameSchema,
  bloodGroup: bloodGroupSchema,
  hospital: z.string().min(2, 'Hospital name is required'),
  district: districtSchema,
  phone: phoneSchema,
  urgency: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Invalid urgency level' })
  }),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  requiredDate: z.string().optional()
});

// Testimonial validation schema
export const testimonialSchema = z.object({
  name: nameSchema,
  role: z.string().min(2, 'Role is required').max(100, 'Role is too long'),
  quote: z.string().min(10, 'Quote must be at least 10 characters').max(500, 'Quote must be less than 500 characters')
});

// Blog post validation schema
export const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional()
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  bloodGroup: bloodGroupSchema.optional(),
  district: districtSchema.optional(),
  age: ageSchema.optional(),
  weight: weightSchema.optional()
});

// Hospital validation schema
export const hospitalSchema = z.object({
  name: z.string().min(2, 'Hospital name is required').max(200, 'Name is too long'),
  address: z.string().min(5, 'Address is required').max(500, 'Address is too long'),
  phone: phoneSchema,
  district: districtSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

// Export all schemas
export const validationSchemas = {
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
  bloodGroup: bloodGroupSchema,
  district: districtSchema,
  age: ageSchema,
  weight: weightSchema,
  login: loginSchema,
  registration: registrationSchema,
  bloodRequest: bloodRequestSchema,
  testimonial: testimonialSchema,
  blogPost: blogPostSchema,
  updateProfile: updateProfileSchema,
  hospital: hospitalSchema
};
