import RecommendationEvent from "../models/RecommendationEvent";

/**
 * Lightweight analytics helpers for recommendation impressions and clicks.
 * Writes are non-fatal; callers should not fail primary flows on errors.
 */
export async function recordImpressions(
  listingIds: string[],
  userId?: string | null,
  context?: string | null,
): Promise<void> {
  try {
    const rows = listingIds
      .filter(Boolean)
      .map((listingId) => ({
        user_id: userId ?? null,
        listing_id: listingId,
        event_type: "IMPRESSION",
        context: context ?? null,
      }));

    if (rows.length === 0) return;

    await RecommendationEvent.bulkCreate(rows as any);
  } catch {
    // Non-fatal
  }
}

export async function recordClick(
  listingId: string,
  userId?: string | null,
  context?: string | null,
): Promise<void> {
  try {
    if (!listingId) return;
    await RecommendationEvent.create({
      user_id: userId ?? null,
      listing_id: listingId,
      event_type: "CLICK",
      context: context ?? null,
    });
  } catch {
    // Non-fatal
  }
}
