import { Favorite, Listing, Category, User, ListingImage } from "../models";
import { formatListing } from "./listing.service";
import { trackInteraction } from "./interaction.service";
import type { SafeListing } from "../types/listing.types";

const listingIncludes = [
  {
    model: Category,
    as: "category",
    attributes: ["id", "name", "slug", "description", "image"],
  },
  {
    model: User,
    as: "seller",
    attributes: [
      "id",
      "full_name",
      "avatar_url",
      "is_email_verified",
      "is_phone_verified",
      "is_fayda_verified",
    ],
  },
  { model: ListingImage, as: "images" },
];

export async function addFavorite(
  userId: string,
  listingId: string,
): Promise<void> {
  const listing = await Listing.findByPk(listingId);
  if (!listing) {
    throw Object.assign(new Error("Listing not found."), { statusCode: 404 });
  }

  // Find or create to prevent duplicates safely
  const [fav, created] = await Favorite.findOrCreate({
    where: { user_id: userId, listing_id: listingId },
    defaults: { user_id: userId, listing_id: listingId },
  });

  // Increment listing favorite_count only when a new favorite is created
  if (created) {
    try {
      await listing.increment("favorite_count");
    } catch {
      // non-fatal
    }
  }

  trackInteraction(userId, "FAVORITE", listingId);
}

export async function removeFavorite(
  userId: string,
  listingId: string,
): Promise<void> {
  const deletedCount = await Favorite.destroy({
    where: { user_id: userId, listing_id: listingId },
  });

  if (!deletedCount) {
    // Already removed or was never favorited; return smoothly
  }
}

export async function isListingFavorited(
  userId: string | undefined,
  listingId: string,
): Promise<boolean> {
  if (!userId) return false;

  const fav = await Favorite.findOne({
    where: { user_id: userId, listing_id: listingId },
  });

  return !!fav;
}

export async function getBatchFavoriteStatus(
  userId: string | undefined,
  listingIds: string[],
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  if (!userId || listingIds.length === 0) return result;

  const favorites = await Favorite.findAll({
    where: {
      user_id: userId,
      listing_id: listingIds,
    },
    attributes: ["listing_id"],
  });

  const favSet = new Set(favorites.map((f) => f.listing_id));
  for (const id of listingIds) {
    result[id] = favSet.has(id);
  }

  return result;
}

export async function getUserFavorites(
  userId: string,
  query: { page?: number; limit?: number },
): Promise<{
  favorites: Array<{ id: string; createdAt: Date; listing: SafeListing }>;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const offset = (page - 1) * limit;

  const { rows, count } = await Favorite.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: Listing,
        as: "listing",
        include: listingIncludes,
        paranoid: false, // Include soft-deleted/archived listings so buyer sees "unavailable" rather than crashing
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit) || 1;

  const favorites = rows
    .filter((f) => (f as Favorite & { listing?: Listing }).listing)
    .map((fav) => {
      const listing = (fav as Favorite & { listing: Listing }).listing;
      return {
        id: fav.id,
        createdAt: fav.created_at,
        listing: formatListing(listing),
      };
    });

  return {
    favorites,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
