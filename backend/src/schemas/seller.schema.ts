import { z } from 'zod'

export const upsertSellerProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters.')
    .max(120, 'Display name must be 120 characters or fewer.')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be 500 characters or fewer.')
    .optional()
    .or(z.literal('')),
  profileImage: z.string().url('Profile image must be a valid URL.').optional().or(z.literal('')),
  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  subCity: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  neighborhood: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
})

export const sellerListingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export type UpsertSellerProfileSchema = z.infer<typeof upsertSellerProfileSchema>
