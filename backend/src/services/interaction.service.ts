/**
 * Behavioral event tracking for the recommendation engine.
 * All writes are fire-and-forget — failures must never break user flows.
 */

import { UserInteraction } from '../models'
import type { InteractionType } from '../models/UserInteraction'

export async function recordInteraction(
  userId: string,
  interactionType: InteractionType,
  listingId?: string | null,
  metadata?: Record<string, unknown> | null,
): Promise<void> {
  try {
    await UserInteraction.create({
      user_id: userId,
      listing_id: listingId ?? null,
      interaction_type: interactionType,
      metadata: metadata ?? null,
    })
  } catch {
    // Non-fatal — tracking must not break primary flows
  }
}

export function trackInteraction(
  userId: string,
  interactionType: InteractionType,
  listingId?: string | null,
  metadata?: Record<string, unknown> | null,
): void {
  recordInteraction(userId, interactionType, listingId, metadata).catch(() => {})
}

export async function recordSearch(userId: string, query: string): Promise<void> {
  const trimmed = query.trim().slice(0, 200)
  if (!trimmed) return
  await recordInteraction(userId, 'SEARCH', null, { query: trimmed })
}

export function trackSearch(userId: string, query: string): void {
  recordSearch(userId, query).catch(() => {})
}

export async function recordCategoryInteraction(
  userId: string,
  categoryId: string,
): Promise<void> {
  await recordInteraction(userId, 'CATEGORY', null, { categoryId })
}

export function trackCategoryInteraction(userId: string, categoryId: string): void {
  recordCategoryInteraction(userId, categoryId).catch(() => {})
}

export async function recordNotInterested(userId: string, listingId: string): Promise<void> {
  await recordInteraction(userId, 'NOT_INTERESTED', listingId)
}
