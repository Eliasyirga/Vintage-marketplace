import { useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import { ListingCard } from "../listings/ListingCard";
import { RecommendationReason } from "./RecommendationReason";
import type { RecommendationItem } from "../../types/recommendation";
import {
  recordImpressions,
  recordClick,
} from "../../services/recommendation.service";

interface RecommendationSectionProps {
  /** Section heading, e.g. "Recommended for You" */
  title: string;
  /** Sub-heading, e.g. "Based on your activity" */
  subtitle?: string;
  /** Items from the recommendation API */
  items: RecommendationItem[];
  /** Whether results are personalized (vs. cold-start trending) */
  isPersonalized?: boolean;
  /** Whether loading is in progress */
  isLoading?: boolean;
  /** Optional "View More" link destination */
  viewMoreHref?: string;
  /** Limit displayed items */
  maxItems?: number;
  /** Optional extra class for the wrapper */
  className?: string;
}

/** Skeleton card for loading state */
function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-44 sm:w-64 rounded-2xl overflow-hidden border border-stone-200 bg-white animate-pulse">
      <div className="aspect-[4/3] bg-stone-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-100 rounded-full w-3/4" />
        <div className="h-3 bg-stone-100 rounded-full w-1/2" />
        <div className="h-5 bg-amber-50 rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}

export function RecommendationSection({
  title,
  subtitle,
  items,
  isPersonalized = false,
  isLoading = false,
  viewMoreHref,
  maxItems = 12,
  className = "",
}: RecommendationSectionProps) {
  const displayItems = items.slice(0, maxItems);
  const TitleIcon = isPersonalized ? Sparkles : TrendingUp;

  // Horizontal scroll ref for smooth scrolling on mobile
  const scrollRef = useRef<HTMLDivElement>(null);

  // Send a single batched impression event when items load (non-fatal)
  useEffect(() => {
    if (isLoading) return;
    if (!displayItems || displayItems.length === 0) return;
    const ids = displayItems.map((it) => it.listing.id);
    const context = title.replace(/\s+/g, "_").toLowerCase();
    recordImpressions(ids, context);
  }, [isLoading, displayItems, title]);

  const handleCardClick = useCallback(
    (listingId: string) => {
      try {
        recordClick(listingId, title.replace(/\s+/g, "_").toLowerCase());
      } catch {
        // non-fatal
      }
    },
    [title],
  );

  if (!isLoading && items.length === 0) return null;

  return (
    <section className={`space-y-4 ${className}`} aria-label={title}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <TitleIcon className="w-5 h-5 text-amber-500" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {viewMoreHref && !isLoading && items.length > 0 && (
          <Link
            to={viewMoreHref}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 whitespace-nowrap"
          >
            View More
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Scrollable card row */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : displayItems.map(({ listing, reason }) => (
              <div
                key={listing.id}
                className="flex-shrink-0 w-44 sm:w-64 snap-start"
                onClick={() => handleCardClick(listing.id)}
              >
                {/* Reason badge above the card */}
                {reason && (
                  <div className="mb-1.5 px-1">
                    <RecommendationReason
                      reason={reason}
                      isPersonalized={isPersonalized}
                    />
                  </div>
                )}
                <ListingCard listing={listing} />
              </div>
            ))}
      </div>
    </section>
  );
}
