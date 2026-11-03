const { z } = require('./common')

const LISTING_TYPES = ['rent', 'sale']
const MAX_IMAGES = 6

const money = z.coerce.number().finite().min(0).max(1_000_000_000)
const rooms = z.coerce.number().int().min(0).max(100)
const imageUrl = z.url({ protocol: /^https?$/ }).max(2048)

const listingFields = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  address: z.string().trim().min(3).max(300),
  regularPrice: money,
  discountPrice: money.default(0),
  bathrooms: rooms,
  bedrooms: rooms,
  furnished: z.boolean(),
  parking: z.boolean(),
  type: z.enum(LISTING_TYPES),
  offer: z.boolean(),
  imageUrls: z.array(imageUrl).min(1, 'at least one image is required').max(MAX_IMAGES),
})

const discountRule = (data) =>
  !data.offer ||
  data.regularPrice === undefined ||
  data.discountPrice === undefined ||
  data.discountPrice < data.regularPrice

const discountIssue = {
  message: 'must be lower than regularPrice',
  path: ['discountPrice'],
}

// userRef is never accepted from the client; it comes from the session.
const createListingSchema = listingFields.refine(discountRule, discountIssue)
const updateListingSchema = listingFields.partial().refine(discountRule, discountIssue)

const booleanFlag = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true')

const SORT_FIELDS = { createdAt: 'createdAt', created_at: 'createdAt', regularPrice: 'regularPrice' }

const searchQuerySchema = z.object({
  searchTerm: z.string().trim().max(100).optional().default(''),
  type: z.enum(['all', ...LISTING_TYPES]).optional().default('all'),
  offer: booleanFlag,
  furnished: booleanFlag,
  parking: booleanFlag,
  sort: z
    .enum(Object.keys(SORT_FIELDS))
    .optional()
    .default('createdAt')
    .transform((v) => SORT_FIELDS[v]),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(9),
  startIndex: z.coerce.number().int().min(0).max(10_000).optional().default(0),
})

module.exports = {
  LISTING_TYPES,
  createListingSchema,
  updateListingSchema,
  searchQuerySchema,
}
