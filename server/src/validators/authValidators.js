const { z } = require('zod');

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .email('Enter a valid email address');

const registerSchema = z.object({
  full_name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must be at most 80 characters'),
  email,
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters') // bcrypt only uses first 72 bytes
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(72, 'Invalid email or password'),
  remember: z.boolean().optional().default(false),
});

module.exports = { registerSchema, loginSchema };
