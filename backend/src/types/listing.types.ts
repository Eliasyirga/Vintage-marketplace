export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "RESERVED"
  | "SOLD"
  | "ARCHIVED"
  | "REMOVED";

export type ListingCondition =
  | "BRAND_NEW"
  | "LIKE_NEW"
  | "LIGHTLY_USED"
  | "FAIR"
  | "HEAVILY_USED";

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: ListingCondition;
  city: string;
  subCity?: string;
  neighborhood?: string;
  status?: "DRAFT" | "ACTIVE";
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  condition?: ListingCondition;
  city?: string;
  subCity?: string;
  neighborhood?: string;
  status?: ListingStatus;
  removeImageIds?: string[];
  imageSortOrder?: Array<{ id: string; sortOrder: number }>;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "most_viewed";

export interface ListingQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  condition?: ListingCondition;
  city?: string;
  subCity?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: SortOption;
  status?: ListingStatus;
  sellerId?: string;
}

export interface SafeSeller {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFaydaVerified: boolean;
}

export interface SafeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface SafeListingImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface SafeListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: ListingCondition;
  city: string;
  subCity: string | null;
  neighborhood: string | null;
  status: ListingStatus;
  viewCount: number;
  favoriteCount: number;
  contactCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: SafeCategory;
  images: SafeListingImage[];
  seller: SafeSeller;
}

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  BRAND_NEW: "Brand New",
  LIKE_NEW: "Like New",
  LIGHTLY_USED: "Lightly Used",
  FAIR: "Fair Condition",
  HEAVILY_USED: "Heavily Used",
};

export const CONDITION_DESCRIPTIONS: Record<ListingCondition, string> = {
  BRAND_NEW: "Never used, still in original packaging.",
  LIKE_NEW: "Used once or twice, looks and works like new.",
  LIGHTLY_USED: "Used carefully with minor signs of use.",
  FAIR: "Shows visible signs of use but works as expected.",
  HEAVILY_USED: "Well-worn with noticeable wear, still functional.",
};
