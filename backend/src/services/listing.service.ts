import { Op, Order, WhereOptions } from "sequelize";
import { sequelize } from "../config/database";
import { Listing, ListingImage, User, Category, SellerProfile } from "../models";
import * as categoryService from "./category.service";
import * as uploadService from "./upload.service";
import { assertCanCreateActiveListing } from "./listingLimit.service";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingQueryParams,
  SafeListing,
  SafeSeller,
  ListingStatus,
  SortOption,
} from "../types/listing.types";

const PUBLIC_STATUSES: ListingStatus[] = ["ACTIVE"];

function formatSeller(user: User): SafeSeller {
  return {
    id: user.id,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    isEmailVerified: user.is_email_verified,
    isPhoneVerified: user.is_phone_verified,
    isFaydaVerified: user.is_fayda_verified,
  };
}

function formatListing(listing: Listing): SafeListing {
  const category = (listing as Listing & { category?: Category }).category;
  const seller = (listing as Listing & { seller?: User }).seller;
  const images = (
    (listing as Listing & { images?: ListingImage[] }).images ?? []
  )
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.toSafeObject());

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price),
    condition: listing.condition,
    city: listing.city,
    subCity: listing.sub_city,
    neighborhood: listing.neighborhood,
    status: listing.status,
    viewCount: listing.view_count,
    favoriteCount: (listing as any).favorite_count ?? 0,
    contactCount: (listing as any).contact_count ?? 0,
    publishedAt: listing.published_at,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    category: category
      ? category.toSafeObject()
      : {
          id: listing.category_id,
          name: "Unknown",
          slug: "unknown",
          description: null,
          image: null,
        },
    images,
    seller: seller
      ? formatSeller(seller)
      : {
          id: listing.seller_id,
          fullName: "Seller",
          avatarUrl: null,
          isEmailVerified: false,
          isPhoneVerified: false,
          isFaydaVerified: false,
        },
  };
}

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

async function findOwnedListing(
  listingId: string,
  sellerId: string,
): Promise<Listing> {
  const listing = await Listing.findOne({
    where: { id: listingId, seller_id: sellerId },
    include: listingIncludes,
  });

  if (!listing) {
    throw Object.assign(
      new Error(
        "Listing not found or you do not have permission to modify it.",
      ),
      {
        statusCode: 404,
      },
    );
  }

  return listing;
}

export async function createListing(
  sellerId: string,
  input: CreateListingInput,
  files: Express.Multer.File[],
): Promise<SafeListing> {
  const category = await categoryService.getCategoryById(input.categoryId);
  if (!category) {
    throw Object.assign(new Error("Please select a valid active category."), {
      statusCode: 400,
    });
  }

  const status = input.status ?? "ACTIVE";
  const listingId = crypto.randomUUID();

  const uploadedImages = await Promise.all(
    files.map((file) => uploadService.saveListingImage(file, listingId)),
  );

  // Ensure SellerProfile exists for this user so selling capability is enabled
  await SellerProfile.findOrCreate({
    where: { user_id: sellerId },
    defaults: { user_id: sellerId, is_active: true },
  });

  const listing = await sequelize.transaction(async (transaction) => {
    if (status === "ACTIVE") {
      await assertCanCreateActiveListing(sellerId, transaction);
    }

    const created = await Listing.create(
      {
        id: listingId,
        seller_id: sellerId,
        category_id: input.categoryId,
        title: input.title.trim(),
        description: input.description.trim(),
        price: input.price.toFixed(2),
        condition: input.condition,
        city: input.city.trim(),
        sub_city: input.subCity?.trim() || null,
        neighborhood: input.neighborhood?.trim() || null,
        status,
        published_at: status === "ACTIVE" ? new Date() : null,
      },
      { transaction },
    );

    if (uploadedImages.length > 0) {
      await ListingImage.bulkCreate(
        uploadedImages.map((image, index) => ({
          listing_id: created.id,
          url: image.url,
          public_id: image.publicId,
          alt_text: input.title.trim(),
          sort_order: index,
          is_cover: index === 0,
          width: image.width ?? null,
          height: image.height ?? null,
          format: image.format ?? null,
          bytes: image.bytes ?? null,
        })),
        { transaction },
      );
    }

    return created;
  });

  const fullListing = await Listing.findByPk(listing.id, {
    include: listingIncludes,
  });
  return formatListing(fullListing!);
}

/** Map whitelisted sort values to Sequelize Order tuples */
function buildOrder(sort: SortOption = "newest"): Order {
  switch (sort) {
    case "oldest":
      return [["created_at", "ASC"]];
    case "price_asc":
      return [["price", "ASC"]];
    case "price_desc":
      return [["price", "DESC"]];
    case "most_viewed":
      return [["view_count", "DESC"]];
    case "newest":
    default:
      return [["created_at", "DESC"]];
  }
}

export async function getPublicListings(query: ListingQueryParams) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const where: WhereOptions = {
    status:
      query.status && PUBLIC_STATUSES.includes(query.status)
        ? query.status
        : "ACTIVE",
  };

  // ── Keyword search (title + description, case-insensitive) ────────────────
  if (query.search && query.search.trim()) {
    const term = `%${query.search.trim()}%`;
    (where as Record<symbol, unknown>)[Op.or] = [
      { title: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
    ];
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  if (query.categoryId) where.category_id = query.categoryId;
  if (query.condition) where.condition = query.condition;
  if (query.city) where.city = { [Op.iLike]: `%${query.city}%` };
  if (query.subCity) where.sub_city = { [Op.iLike]: `%${query.subCity}%` };
  if (query.neighborhood)
    where.neighborhood = { [Op.iLike]: `%${query.neighborhood}%` };
  if (query.sellerId) where.seller_id = query.sellerId;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined
        ? { [Op.gte]: query.minPrice.toFixed(2) }
        : {}),
      ...(query.maxPrice !== undefined
        ? { [Op.lte]: query.maxPrice.toFixed(2) }
        : {}),
    };
  }

  const { rows, count } = await Listing.findAndCountAll({
    where,
    include: listingIncludes,
    order: buildOrder(query.sort),
    limit,
    offset,
    distinct: true,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    listings: rows.map(formatListing),
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

export async function getListingById(
  listingId: string,
  options?: { incrementView?: boolean; requesterId?: string },
): Promise<SafeListing> {
  const listing = await Listing.findByPk(listingId, {
    include: listingIncludes,
  });

  if (!listing) {
    throw Object.assign(new Error("Listing not found."), { statusCode: 404 });
  }

  const isOwner = options?.requesterId === listing.seller_id;
  const isPublic = PUBLIC_STATUSES.includes(listing.status);

  if (!isPublic && !isOwner) {
    throw Object.assign(new Error("Listing not found."), { statusCode: 404 });
  }

  if (options?.incrementView && isPublic) {
    await listing.increment("view_count");
    listing.view_count += 1;
  }

  return formatListing(listing);
}

export async function getMyListings(
  sellerId: string,
  query: { page?: number; limit?: number; status?: ListingStatus },
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = { seller_id: sellerId };
  if (query.status) where.status = query.status;

  const { rows, count } = await Listing.findAndCountAll({
    where,
    include: listingIncludes,
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    listings: rows.map(formatListing),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function updateListing(
  listingId: string,
  sellerId: string,
  input: UpdateListingInput,
  files: Express.Multer.File[],
): Promise<SafeListing> {
  const listing = await findOwnedListing(listingId, sellerId);

  if (listing.status === "REMOVED") {
    throw Object.assign(new Error("This listing cannot be edited."), {
      statusCode: 403,
    });
  }

  if (input.categoryId) {
    const category = await categoryService.getCategoryById(input.categoryId);
    if (!category) {
      throw Object.assign(new Error("Please select a valid active category."), {
        statusCode: 400,
      });
    }
  }

  const removeIds = input.removeImageIds ?? [];
  const existingImages = listing.get("images") as ListingImage[];
  const remainingAfterRemoval = existingImages.filter(
    (img) => !removeIds.includes(img.id),
  );
  const targetStatus = input.status ?? listing.status;

  if (remainingAfterRemoval.length + files.length > 8) {
    throw Object.assign(new Error("A listing can have at most 8 images."), {
      statusCode: 400,
    });
  }

  if (
    targetStatus === "ACTIVE" &&
    remainingAfterRemoval.length + files.length < 1
  ) {
    throw Object.assign(
      new Error("At least one image is required to publish a listing."),
      {
        statusCode: 400,
      },
    );
  }

  const uploadedImages = await Promise.all(
    files.map((file) => uploadService.saveListingImage(file, listing.id)),
  );
  const imagesToDelete = existingImages.filter((img) =>
    removeIds.includes(img.id),
  );

  await sequelize.transaction(async (transaction) => {
    if (input.title !== undefined) listing.title = input.title.trim();
    if (input.description !== undefined)
      listing.description = input.description.trim();
    if (input.price !== undefined) listing.price = input.price.toFixed(2);
    if (input.categoryId !== undefined) listing.category_id = input.categoryId;
    if (input.condition !== undefined) listing.condition = input.condition;
    if (input.city !== undefined) listing.city = input.city.trim();
    if (input.subCity !== undefined)
      listing.sub_city = input.subCity.trim() || null;
    if (input.neighborhood !== undefined)
      listing.neighborhood = input.neighborhood.trim() || null;

    if (input.status !== undefined) {
      if (input.status === "ACTIVE" && listing.status !== "ACTIVE" && listing.status !== "RESERVED") {
        await assertCanCreateActiveListing(sellerId, transaction, listing.id);
      }
      listing.status = input.status;
      if (input.status === "ACTIVE" && !listing.published_at) {
        listing.published_at = new Date();
      }
    }

    await listing.save({ transaction });

    if (removeIds.length > 0) {
      await ListingImage.destroy({
        where: { id: { [Op.in]: removeIds }, listing_id: listing.id },
        transaction,
      });
    }

    if (input.imageSortOrder?.length) {
      for (const item of input.imageSortOrder) {
        await ListingImage.update(
          { sort_order: item.sortOrder },
          { where: { id: item.id, listing_id: listing.id }, transaction },
        );
      }
    }

    if (uploadedImages.length > 0) {
      const startOrder =
        remainingAfterRemoval.length > 0
          ? Math.max(...remainingAfterRemoval.map((img) => img.sort_order)) + 1
          : 0;

      await ListingImage.bulkCreate(
        uploadedImages.map((image, index) => ({
          listing_id: listing.id,
          url: image.url,
          public_id: image.publicId,
          alt_text: listing.title,
          sort_order: startOrder + index,
          is_cover: remainingAfterRemoval.length === 0 && index === 0,
          width: image.width ?? null,
          height: image.height ?? null,
          format: image.format ?? null,
          bytes: image.bytes ?? null,
        })),
        { transaction },
      );
    }
  });

  await uploadService.deleteListingImages(
    imagesToDelete.map((img) => img.public_id),
  );

  const updated = await Listing.findByPk(listing.id, {
    include: listingIncludes,
  });
  return formatListing(updated!);
}

export async function updateListingStatus(
  listingId: string,
  sellerId: string,
  status: "ACTIVE" | "SOLD" | "ARCHIVED",
): Promise<SafeListing> {
  const listing = await findOwnedListing(listingId, sellerId);

  if (listing.status === "REMOVED") {
    throw Object.assign(new Error("This listing cannot be modified."), {
      statusCode: 403,
    });
  }

  const allowedTransitions: Record<string, ListingStatus[]> = {
    DRAFT: ["ACTIVE", "ARCHIVED"],
    ACTIVE: ["SOLD", "ARCHIVED"],
    SOLD: ["ACTIVE", "ARCHIVED"],
    ARCHIVED: ["ACTIVE"],
  };

  const allowed = allowedTransitions[listing.status] ?? [];
  if (!allowed.includes(status)) {
    throw Object.assign(
      new Error(
        `Cannot change listing status from ${listing.status} to ${status}.`,
      ),
      {
        statusCode: 400,
      },
    );
  }

  if (status === "ACTIVE") {
    const imageCount = await ListingImage.count({
      where: { listing_id: listing.id },
    });
    if (imageCount < 1) {
      throw Object.assign(
        new Error("At least one image is required to publish a listing."),
        {
          statusCode: 400,
        },
      );
    }
  }

  await sequelize.transaction(async (transaction) => {
    if (status === "ACTIVE" && listing.status !== "ACTIVE" && listing.status !== "RESERVED") {
      await assertCanCreateActiveListing(sellerId, transaction, listing.id);
    }

    listing.status = status;
    if (status === "ACTIVE" && !listing.published_at) {
      listing.published_at = new Date();
    }
    await listing.save({ transaction });
  });

  const updated = await Listing.findByPk(listing.id, {
    include: listingIncludes,
  });
  return formatListing(updated!);
}

export async function deleteListing(
  listingId: string,
  sellerId: string,
): Promise<void> {
  const listing = await findOwnedListing(listingId, sellerId);
  const images = (listing.get("images") as ListingImage[]) ?? [];

  listing.status = "ARCHIVED";
  await listing.save();
  await listing.destroy();

  await uploadService.deleteListingImages(images.map((img) => img.public_id));
}

export { formatListing };
