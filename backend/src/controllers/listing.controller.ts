import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import {
  createListingSchema,
  updateListingSchema,
  updateListingStatusSchema,
  listingQuerySchema,
  myListingsQuerySchema,
} from "../schemas/listing.schema";
import * as listingService from "../services/listing.service";
import {
  validateImageCount,
  validateTotalImageCount,
} from "../middleware/upload.middleware";
import * as interactionService from "../services/interaction.service";
import type {
  CreateListingInput,
  UpdateListingInput,
} from "../types/listing.types";

function parseJsonField<T>(
  value: unknown,
  fallback: T | undefined,
): T | undefined {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function validateCreateBody(body: Record<string, unknown>) {
  const result = createListingSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    const err = Object.assign(new Error("Validation failed."), {
      statusCode: 400,
      errors,
    });
    throw err;
  }
  return result.data;
}

function validateUpdateBody(body: Record<string, unknown>) {
  const parsed = {
    ...body,
    removeImageIds: parseJsonField<string[]>(body.removeImageIds, undefined),
    imageSortOrder: parseJsonField<Array<{ id: string; sortOrder: number }>>(
      body.imageSortOrder,
      undefined,
    ),
  };

  const result = updateListingSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw Object.assign(new Error("Validation failed."), {
      statusCode: 400,
      errors,
    });
  }
  return result.data;
}

function sendValidationError(
  res: Response,
  err: Error & { errors?: unknown },
): void {
  res.status(400).json({
    success: false,
    message: err.message,
    errors: err.errors,
  });
}

export async function createListing(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = validateCreateBody(req.body);
    const files = (req.files as Express.Multer.File[]) ?? [];

    validateImageCount(files, input.status);

    const listing = await listingService.createListing(
      req.user!.id,
      input as CreateListingInput,
      files,
    );

    const message =
      input.status === "DRAFT"
        ? "Draft saved successfully."
        : "Your listing has been published successfully.";

    res.status(201).json({ success: true, message, data: { listing } });
  } catch (err) {
    const e = err as Error & { statusCode?: number; errors?: unknown };
    if (e.statusCode === 400 && e.errors) {
      sendValidationError(res, e);
      return;
    }
    next(err);
  }
}

export async function getListings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = listingQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: "Invalid query parameters." });
      return;
    }

    // Record deliberate search submissions and category filter interactions
    // for authenticated users (fire-and-forget). This feeds recommendation signals.
    if (req.user?.id) {
      try {
        if (parsed.data.search && String(parsed.data.search).trim()) {
          interactionService.trackSearch(
            req.user.id,
            String(parsed.data.search),
          );
        }
        if (parsed.data.categoryId) {
          interactionService.trackCategoryInteraction(
            req.user.id,
            String(parsed.data.categoryId),
          );
        }
      } catch {
        // Non-fatal: do not block listings on tracking errors
      }
    }

    const result = await listingService.getPublicListings(parsed.data);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

import * as recentlyViewedService from "../services/recentlyViewed.service";

export async function getListingById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listingId = req.params.id as string;
    const listing = await listingService.getListingById(listingId, {
      incrementView: true,
      requesterId: req.user?.id,
    });

    // If authenticated, record into recently viewed
    if (req.user?.id) {
      recentlyViewedService
        .recordRecentlyViewed(req.user.id, listingId)
        .catch(() => {});
    }

    res.status(200).json({ success: true, data: { listing } });
  } catch (err) {
    next(err);
  }
}

export async function getMyListings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = myListingsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: "Invalid query parameters." });
      return;
    }

    const result = await listingService.getMyListings(
      req.user!.id,
      parsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateListing(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listingId = req.params.id as string;
    const input = validateUpdateBody(req.body);
    const files = (req.files as Express.Multer.File[]) ?? [];

    const existing = await listingService.getListingById(listingId, {
      requesterId: req.user!.id,
    });

    if (existing.seller.id !== req.user!.id) {
      res
        .status(403)
        .json({
          success: false,
          message: "You do not have permission to edit this listing.",
        });
      return;
    }

    validateTotalImageCount(
      existing.images.length,
      files.length,
      input.removeImageIds?.length ?? 0,
      input.status,
    );

    const listing = await listingService.updateListing(
      listingId,
      req.user!.id,
      input as UpdateListingInput,
      files,
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Listing updated successfully.",
        data: { listing },
      });
  } catch (err) {
    const e = err as Error & { statusCode?: number; errors?: unknown };
    if (e.statusCode === 400 && e.errors) {
      sendValidationError(res, e);
      return;
    }
    next(err);
  }
}

export async function updateListingStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listingId = req.params.id as string;
    const parsed = updateListingStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: "Invalid status value." });
      return;
    }

    const listing = await listingService.updateListingStatus(
      listingId,
      req.user!.id,
      parsed.data.status,
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Listing status updated.",
        data: { listing },
      });
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listingId = req.params.id as string;
    await listingService.deleteListing(listingId, req.user!.id);
    res
      .status(200)
      .json({ success: true, message: "Listing archived and removed." });
  } catch (err) {
    next(err);
  }
}
