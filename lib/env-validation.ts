// Environment Variable Validation
// Ensures all required environment variables are present and valid

interface EnvVarConfig {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email';
  minLength?: number;
  pattern?: RegExp;
  description: string;
}

const envConfigs: EnvVarConfig[] = [
  // Supabase Configuration
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    type: 'url',
    description: 'Supabase project URL'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    type: 'string',
    minLength: 20,
    description: 'Supabase anonymous key'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    type: 'string',
    minLength: 20,
    description: 'Supabase service role key'
  },
  
  // App Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    type: 'url',
    description: 'Application URL'
  },
  {
    name: 'NODE_ENV',
    required: false,
    type: 'string',
    pattern: /^(development|production|test)$/,
    description: 'Node environment'
  },
  
  // Security Configuration
  {
    name: 'JWT_SECRET',
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT secret key (must be at least 32 characters)'
  },
  {
    name: 'ALLOWED_ORIGIN',
    required: true,
    type: 'url',
    description: 'CORS allowed origin'
  },
  
  // Email Configuration
  {
    name: 'RESEND_API_KEY',
    required: false,
    type: 'string',
    minLength: 10,
    description: 'Resend API key for email sending'
  },
  {
    name: 'NEXT_PUBLIC_EMAIL_FROM',
    required: false,
    type: 'email',
    description: 'From email address'
  },
  
  // Optional Services
  {
    name: 'IPSTACK_API_KEY',
    required: false,
    type: 'string',
    minLength: 10,
    description: 'IPStack API key for geolocation'
  },
  {
    name: 'VIRUSTOTAL_API_KEY',
    required: false,
    type: 'string',
    minLength: 10,
    description: 'VirusTotal API key for malware scanning'
  },
  {
    name: 'REDIS_URL',
    required: false,
    type: 'url',
    description: 'Redis URL for distributed rate limiting'
  },
  {
    name: 'MAPBOX_ACCESS_TOKEN',
    required: false,
    type: 'string',
    minLength: 10,
    description: 'Mapbox access token for maps'
  },
  {
    name: 'ONESIGNAL_APP_ID',
    required: false,
    type: 'string',
    minLength: 10,
    description: 'OneSignal app ID for push notifications'
  },
  {
    name: 'ONESIGNAL_REST_API_KEY',
    required: false,
    type: 'string',
    minLength: 10,
    description: 'OneSignal REST API key'
  }
];

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function validateValue(config: EnvVarConfig, value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    if (config.required) {
      return { valid: false, error: `${config.name} is required` };
    }
    return { valid: true };
  }

  // Type validation
  switch (config.type) {
    case 'url':
      if (!validateUrl(value)) {
        return { valid: false, error: `${config.name} must be a valid URL` };
      }
      break;
    
    case 'email':
      if (!validateEmail(value)) {
        return { valid: false, error: `${config.name} must be a valid email` };
      }
      break;
    
    case 'number':
      if (isNaN(Number(value))) {
        return { valid: false, error: `${config.name} must be a number` };
      }
      break;
    
    case 'boolean':
      if (!['true', 'false'].includes(value.toLowerCase())) {
        return { valid: false, error: `${config.name} must be true or false` };
      }
      break;
  }

  // Length validation
  if (config.minLength && value.length < config.minLength) {
    return { 
      valid: false, 
      error: `${config.name} must be at least ${config.minLength} characters long` 
    };
  }

  // Pattern validation
  if (config.pattern && !config.pattern.test(value)) {
    return { valid: false, error: `${config.name} format is invalid` };
  }

  return { valid: true };
}

export function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const config of envConfigs) {
    const value = process.env[config.name];
    const validation = validateValue(config, value || '');

    if (!validation.valid) {
      errors.push(validation.error || `${config.name} is invalid`);
    } else if (!value && !config.required) {
      warnings.push(`${config.name} is not set (${config.description})`);
    }
  }

  // Additional validations
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    // Production-specific checks
    if (!process.env.RESEND_API_KEY) {
      warnings.push('RESEND_API_KEY is recommended in production for email functionality');
    }
    if (!process.env.REDIS_URL) {
      warnings.push('REDIS_URL is recommended in production for distributed rate limiting');
    }
    if (process.env.JWT_SECRET === 'dev_secret_key_32_characters_long_12345678901234567890') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function getEnvironmentSummary(): {
  required: { set: string[]; missing: string[] };
  optional: { set: string[]; missing: string[] };
  nodeEnv: string;
  isProduction: boolean;
} {
  const required = { set: [] as string[], missing: [] as string[] };
  const optional = { set: [] as string[], missing: [] as string[] };
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  for (const config of envConfigs) {
    const value = process.env[config.name];
    const target = config.required ? required : optional;

    if (value && value.trim() !== '') {
      target.set.push(config.name);
    } else {
      target.missing.push(config.name);
    }
  }

  return {
    required,
    optional,
    nodeEnv,
    isProduction
  };
}

export function validateCriticalEnvironment(): { valid: boolean; missing: string[] } {
  const criticalVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'ALLOWED_ORIGIN'
  ];

  const missing = criticalVars.filter(name => !process.env[name]);

  return {
    valid: missing.length === 0,
    missing
  };
}
