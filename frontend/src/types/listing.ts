export type ListingCondition =
  | "BRAND_NEW"
  | "LIKE_NEW"
  | "LIGHTLY_USED"
  | "FAIR"
  | "HEAVILY_USED";

export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "SOLD"
  | "ARCHIVED"
  | "REMOVED";

export interface SafeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
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

export interface SafeListingImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Listing {
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
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: SafeCategory;
  images: SafeListingImage[];
  seller: SafeSeller;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "most_viewed";

export interface ListingPagination {
  page: number;
  limit: number;
  total?: number;
  totalItems?: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ListingsResponse {
  listings: Listing[];
  pagination: ListingPagination;
}

export interface CreateListingFormState {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  condition: ListingCondition;
  city: string;
  subCity: string;
  neighborhood: string;
  status: ListingStatus;
}

export interface UpdateListingFormState {
  title?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  condition?: ListingCondition;
  city?: string;
  subCity?: string;
  neighborhood?: string;
  status?: ListingStatus;
}

export const CONDITION_LABELS: Record<
  ListingCondition,
  { title: string; description: string }
> = {
  BRAND_NEW: {
    title: "Brand New",
    description: "Unused item in original packaging with tags intact.",
  },
  LIKE_NEW: {
    title: "Like New",
    description: "Practically brand new with no visible wear or signs of use.",
  },
  LIGHTLY_USED: {
    title: "Lightly Used",
    description: "Used carefully with minor signs of use, fully functional.",
  },
  FAIR: {
    title: "Fair Condition",
    description:
      "Shows visible signs of use or minor wear but works as expected.",
  },
  HEAVILY_USED: {
    title: "Heavily Used",
    description: "Well used with noticeable cosmetic or functional wear.",
  },
};
