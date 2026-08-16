import api from "./api";
import type {
  RecommendationResponse,
  SimilarProductsResponse,
} from "../types/recommendation";

/**
 * GET /api/recommendations
 * Returns personalized recommendations for authenticated users,
 * or trending listings for guests.
 */
export async function getRecommendations(
  limit = 12,
): Promise<RecommendationResponse> {
  try {
    const res = await api.get<{
      success: boolean;
      data: RecommendationResponse;
    }>("/recommendations", { params: { limit } });
    return res.data.data;
  } catch {
    return { items: [], isPersonalized: false, fallbackReason: "trending" };
  }
}

/**
 * GET /api/listings/:listingId/similar
 * Returns listings similar to the given listing.
 */
export async function getSimilarListings(
  listingId: string,
  limit = 8,
): Promise<SimilarProductsResponse> {
  try {
    const res = await api.get<{
      success: boolean;
      data: SimilarProductsResponse;
    }>(`/listings/${listingId}/similar`, { params: { limit } });
    return res.data.data;
  } catch {
    return { items: [] };
  }
}

/** Record a submitted search query (authenticated users only). */
export async function trackSearchQuery(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    await api.post("/recommendations/track-search", { query: trimmed });
  } catch {
    // Non-fatal
  }
}

/** Record a category filter interaction (authenticated users only). */
export async function trackCategoryInteraction(
  categoryId: string,
): Promise<void> {
  if (!categoryId) return;
  try {
    await api.post("/recommendations/track-category", { categoryId });
  } catch {
    // Non-fatal
  }
}

/** Mark a recommended listing as not interested. */
export async function markNotInterested(listingId: string): Promise<void> {
  try {
    await api.post(`/recommendations/${listingId}/not-interested`);
  } catch {
    // Non-fatal
  }
}

/**
 * Record a batch of recommendation card impressions (anonymous allowed).
 * Body: { listingIds: string[], context?: string }
 */
export async function recordImpressions(
  listingIds: string[],
  context?: string,
): Promise<void> {
  if (!listingIds || listingIds.length === 0) return;
  try {
    await api.post("/recommendations/impression", { listingIds, context });
  } catch {
    // Non-fatal
  }
}

/**
 * Record a click on a recommended listing (anonymous allowed).
 */
export async function recordClick(
  listingId: string,
  context?: string,
): Promise<void> {
  if (!listingId) return;
  try {
    await api.post(`/recommendations/${listingId}/click`, { context });
  } catch {
    // Non-fatal
  }
}
