import UserBlock from '../models/UserBlock'
import { Op } from 'sequelize'

/**
 * Block a user. Idempotent — second call is a no-op (returns existing block).
 */
export async function blockUser(
  blockerId: string,
  blockedUserId: string,
): Promise<{ isNew: boolean }> {
  if (blockerId === blockedUserId) {
    throw Object.assign(new Error('You cannot block yourself.'), { statusCode: 400 })
  }

  const [, created] = await UserBlock.findOrCreate({
    where: { blocker_id: blockerId, blocked_user_id: blockedUserId },
    defaults: { blocker_id: blockerId, blocked_user_id: blockedUserId },
  })

  return { isNew: created }
}

/**
 * Unblock a user.
 */
export async function unblockUser(
  blockerId: string,
  blockedUserId: string,
): Promise<void> {
  const deleted = await UserBlock.destroy({
    where: { blocker_id: blockerId, blocked_user_id: blockedUserId },
  })

  if (!deleted) {
    throw Object.assign(new Error('Block not found.'), { statusCode: 404 })
  }
}

/**
 * Return the list of user IDs that the given user has blocked.
 */
export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  const blocks = await UserBlock.findAll({
    where: { blocker_id: blockerId },
    attributes: ['blocked_user_id'],
  })
  return blocks.map((b) => b.blocked_user_id)
}

/**
 * Check if userA has blocked userB or vice-versa.
 */
export async function isBlocked(userA: string, userB: string): Promise<boolean> {
  const count = await UserBlock.count({
    where: {
      [Op.or]: [
        { blocker_id: userA, blocked_user_id: userB },
        { blocker_id: userB, blocked_user_id: userA },
      ],
    },
  })
  return count > 0
}
