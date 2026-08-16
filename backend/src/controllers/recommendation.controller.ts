import type { Request, Response, NextFunction } from "express";
import * as recommendationService from "../services/recommendation.service";
import * as interactionService from "../services/interaction.service";
import * as analyticsService from "../services/recommendationAnalytics.service";

/**
 * GET /api/recommendations
 * Authentication: optional — authenticated users get personalized results,
 * guests get popular/trending fallback.
 * Query: ?limit=12 (default 12, max 30)
 */
export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = Math.min(
      30,
      Math.max(1, parseInt(String(req.query.limit ?? "12"), 10) || 12),
    );
    const userId = req.user?.id;

    const result = await recommendationService.getRecommendations(
      userId,
      limit,
    );

    res.json({
      success: true,
      data: {
        items: result.items,
        isPersonalized: result.isPersonalized,
        ...(result.fallbackReason && { fallbackReason: result.fallbackReason }),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/listings/:listingId/similar
 * Public endpoint — no auth required.
 * Query: ?limit=8 (default 8, max 12)
 */
export async function getSimilarListings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rawId = req.params.listingId || req.params.id;
    const listingIdStr = Array.isArray(rawId) ? rawId[0] : rawId;
    const limit = Math.min(
      12,
      Math.max(1, parseInt(String(req.query.limit ?? "8"), 10) || 8),
    );

    const items = await recommendationService.getSimilarListings(
      listingIdStr,
      limit,
    );

    res.json({
      success: true,
      data: { items },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recommendations/:listingId/not-interested
 * Records a negative signal — reduces this listing in future recommendations.
 */
export async function markNotInterested(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { listingId } = req.params;
    const listingIdStr = Array.isArray(listingId) ? listingId[0] : listingId;
    await interactionService.recordNotInterested(req.user!.id, listingIdStr);
    res.json({ success: true, message: "Preference recorded." });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recommendations/track-search
 * Records a search query after the buyer submits a search (not per keystroke).
 */
export async function trackSearch(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = String(req.body?.query ?? "").trim();
    if (!query) {
      res
        .status(400)
        .json({ success: false, message: "Search query is required." });
      return;
    }
    await interactionService.recordSearch(req.user!.id, query);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recommendations/track-category
 * Records category filter interaction from marketplace browse.
 */
export async function trackCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categoryId = String(req.body?.categoryId ?? "").trim();
    if (!categoryId) {
      res
        .status(400)
        .json({ success: false, message: "Category ID is required." });
      return;
    }
    await interactionService.recordCategoryInteraction(
      req.user!.id,
      categoryId,
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recommendations/impression
 * Body: { listingIds: string[], context?: string }
 * Optional auth: accept anonymous impressions.
 */
export async function trackImpression(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listingIds = Array.isArray(req.body?.listingIds)
      ? req.body.listingIds
      : [];
    if (!listingIds.length) {
      res
        .status(400)
        .json({ success: false, message: "listingIds are required." });
      return;
    }
    const context = String(req.body?.context ?? "").trim() || null;
    // Fire-and-forget
    analyticsService
      .recordImpressions(listingIds, req.user?.id ?? null, context)
      .catch(() => {});
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recommendations/:listingId/click
 * Records a click on a recommended listing (optional auth)
 */
export async function trackClick(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { listingId } = req.params;
    const listingIdStr = Array.isArray(listingId) ? listingId[0] : listingId;
    if (!listingIdStr) {
      res
        .status(400)
        .json({ success: false, message: "listingId is required." });
      return;
    }
    const context = String(req.body?.context ?? "").trim() || null;
    analyticsService
      .recordClick(listingIdStr, req.user?.id ?? null, context)
      .catch(() => {});
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
