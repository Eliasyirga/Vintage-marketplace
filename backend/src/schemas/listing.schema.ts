import { z } from 'zod'

const listingCondition = z.enum([
  'BRAND_NEW',
  'LIKE_NEW',
  'LIGHTLY_USED',
  'FAIR',
  'HEAVILY_USED',
])

const listingStatus = z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED', 'REMOVED'])

/** Whitelisted sort values — never allow arbitrary DB column names from client */
const sortOption = z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'most_viewed'])

const MAX_PRICE = 99_999_999.99

export const createListingSchema = z
  .object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters.').max(120),
    description: z.string().trim().max(5000),
    price: z.coerce
      .number({ message: 'Price must be a valid number.' })
      .positive('Price must be greater than 0.')
      .max(MAX_PRICE, 'Price exceeds the maximum allowed value.'),
    categoryId: z.string().uuid('Please select a valid category.'),
    condition: listingCondition,
    city: z.string().trim().min(2, 'City is required.').max(100),
    subCity: z.string().trim().max(100).optional().or(z.literal('')),
    neighborhood: z.string().trim().max(100).optional().or(z.literal('')),
    status: z.enum(['DRAFT', 'ACTIVE']).default('ACTIVE'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'ACTIVE') {
      if (data.description.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Description must be at least 20 characters to publish.',
          path: ['description'],
        })
      }
    } else if (data.description.trim().length > 0 && data.description.trim().length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Description must be at least 20 characters when provided.',
        path: ['description'],
      })
    }
  })

export const updateListingSchema = z
  .object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(20).max(5000).optional(),
    price: z.coerce.number().positive().max(MAX_PRICE).optional(),
    categoryId: z.string().uuid().optional(),
    condition: listingCondition.optional(),
    city: z.string().trim().min(2).max(100).optional(),
    subCity: z.string().trim().max(100).optional().or(z.literal('')),
    neighborhood: z.string().trim().max(100).optional().or(z.literal('')),
    status: listingStatus.optional(),
    removeImageIds: z.array(z.string().uuid()).optional(),
    imageSortOrder: z
      .array(
        z.object({
          id: z.string().uuid(),
          sortOrder: z.number().int().min(0).max(7),
        }),
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update.',
  })

export const updateListingStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SOLD', 'ARCHIVED']),
})

export const listingQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    categoryId: z.string().uuid().optional(),
    condition: listingCondition.optional(),
    city: z.string().trim().max(100).optional(),
    subCity: z.string().trim().max(100).optional(),
    neighborhood: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().trim().max(200).optional(),
    sort: sortOption.default('newest'),
    status: listingStatus.optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice
      }
      return true
    },
    { message: 'minPrice must be less than or equal to maxPrice.', path: ['minPrice'] },
  )

export const myListingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: listingStatus.optional(),
})

export type CreateListingSchema = z.infer<typeof createListingSchema>
export type UpdateListingSchema = z.infer<typeof updateListingSchema>
