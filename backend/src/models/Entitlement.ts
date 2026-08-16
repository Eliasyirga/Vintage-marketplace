import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { EntitlementType, EntitlementStatus } from '../types/monetization.types'

export interface EntitlementAttributes {
  id: string
  user_id: string
  listing_id: string | null
  type: EntitlementType
  status: EntitlementStatus
  start_at: Date
  expires_at: Date | null
  payment_id: string | null
  metadata: Record<string, unknown> | null
  created_at?: Date
  updated_at?: Date
}

type EntitlementCreationAttributes = Optional<
  EntitlementAttributes,
  'id' | 'listing_id' | 'status' | 'expires_at' | 'payment_id' | 'metadata' | 'created_at' | 'updated_at'
>

class Entitlement extends Model<EntitlementAttributes, EntitlementCreationAttributes> {
  declare id: string
  declare user_id: string
  declare listing_id: string | null
  declare type: EntitlementType
  declare status: EntitlementStatus
  declare start_at: Date
  declare expires_at: Date | null
  declare payment_id: string | null
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  /** Returns true if this entitlement is currently active and not expired */
  isActive(): boolean {
    if (this.status !== 'ACTIVE') return false
    if (!this.expires_at) return true
    return new Date(this.expires_at).getTime() > Date.now()
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      listingId: this.listing_id,
      type: this.type,
      status: this.status,
      startAt: this.start_at,
      expiresAt: this.expires_at,
      paymentId: this.payment_id,
      metadata: this.metadata,
      isActive: this.isActive(),
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Entitlement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    listing_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(
        'FEATURED',
        'BOOST',
        'PREMIUM_SELLER',
        'BUSINESS_ACCOUNT',
        'VERIFIED_SELLER',
        'ANALYTICS',
        'ADVERTISEMENT',
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'REVOKED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'payments', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'entitlements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_entitlements_user_id', fields: ['user_id'] },
      { name: 'idx_entitlements_listing_id', fields: ['listing_id'] },
      { name: 'idx_entitlements_user_type_status', fields: ['user_id', 'type', 'status'] },
      { name: 'idx_entitlements_listing_type_status', fields: ['listing_id', 'type', 'status'] },
      { name: 'idx_entitlements_expires_at', fields: ['expires_at'] },
    ],
  },
)

export default Entitlement
