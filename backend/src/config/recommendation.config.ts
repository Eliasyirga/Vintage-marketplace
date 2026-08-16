/**
 * Recommendation Engine Configuration
 *
 * All weights and tuneable constants are defined here.
 * To re-tune the engine, change only this file — no other code needs to change.
 *
 * Weights represent the maximum points a listing can earn for each signal.
 * Total max score = sum of all weights.
 */

export const WEIGHTS = {
  /** Points for matching the user's most interacted category */
  CATEGORY: 35,
  /** Points for price similarity (normalized, 0–1 scale) */
  PRICE: 20,
  /** Points for location match (neighborhood > sub_city > city) */
  LOCATION: 20,
  /** Points for matching user's preferred condition */
  CONDITION: 10,
  /** Points for strong behavioral signals (favorites, contacts) */
  BEHAVIOR: 10,
  /** Points for listing popularity (view_count) */
  POPULARITY: 3,
  /** Points for listing freshness (recently published) */
  FRESHNESS: 2,
  /** Bonus points for matching recent search terms */
  SEARCH: 5,
} as const

/**
 * Relative strength of behavioral signals when building a user profile.
 * Higher weight = stronger influence on recommendations.
 */
export const SIGNAL_WEIGHTS = {
  CONTACT: 3,
  FAVORITE: 2,
  VIEW: 1,
  SEARCH: 1.5,
  CATEGORY: 1.2,
} as const

/**
 * Penalty multiplier applied to listings the user marked "not interested".
 * Does not permanently block — only reduces score for that listing.
 */
export const NOT_INTERESTED_PENALTY = 0.15

/**
 * Time decay half-life in days.
 * Interactions older than this many days contribute at half strength.
 * Formula: factor = exp(-daysSince / HALF_LIFE_DAYS)
 */
export const HALF_LIFE_DAYS = 30

/**
 * Maximum candidate listings to fetch from DB before scoring.
 * Keeps scoring fast at MVP scale without full-table scans.
 */
export const MAX_CANDIDATES = 200

/**
 * Maximum listings returned per recommendation request.
 */
export const MAX_LIMIT = 30
export const DEFAULT_LIMIT = 12

/**
 * Look back this many days for behavioral signals.
 * Older interactions are ignored entirely.
 */
export const SIGNAL_LOOKBACK_DAYS = 90

/**
 * Diversity: max listings from the same category in one response.
 * Prevents showing 12 identical Samsung phones.
 */
export const MAX_PER_CATEGORY = 4

/**
 * How many recently-viewed listings to use for profile extraction.
 */
export const MAX_RECENT_VIEWS_FOR_PROFILE = 20

/**
 * Location scoring weights.
 */
export const LOCATION_SCORES = {
  SAME_NEIGHBORHOOD: 1.0,
  SAME_SUB_CITY: 0.7,
  SAME_CITY: 0.4,
  DIFFERENT: 0.0,
} as const

/**
 * Location partial credit for sub_city match when neighborhood doesn't match.
 */
export const CONDITION_ORDER: string[] = [
  'BRAND_NEW',
  'LIKE_NEW',
  'LIGHTLY_USED',
  'FAIR',
  'HEAVILY_USED',
]

/**
 * Popularity normalization cap.
 * Listings with view_count >= this value get full popularity score.
 */
export const POPULARITY_VIEW_CAP = 500
