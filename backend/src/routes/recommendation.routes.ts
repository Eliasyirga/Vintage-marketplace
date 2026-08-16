import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";
import * as recommendationController from "../controllers/recommendation.controller";

const router = Router();

/**
 * GET /api/recommendations
 * Optional auth: personalized for authenticated, trending for guests.
 */
router.get("/", optionalAuth, recommendationController.getRecommendations);

router.post("/track-search", requireAuth, recommendationController.trackSearch);
router.post(
  "/track-category",
  requireAuth,
  recommendationController.trackCategory,
);
router.post(
  "/:listingId/not-interested",
  requireAuth,
  recommendationController.markNotInterested,
);
// Recommendation analytics
// Impressions: can be recorded anonymously (optional auth)
router.post(
  "/impression",
  optionalAuth,
  recommendationController.trackImpression,
);
// Clicks on a recommended listing (optional auth)
router.post(
  "/:listingId/click",
  optionalAuth,
  recommendationController.trackClick,
);

export default router;
