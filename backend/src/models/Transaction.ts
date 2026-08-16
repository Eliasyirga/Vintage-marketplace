import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { TransactionStatus } from '../types/monetization.types'

export interface TransactionAttributes {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  amount: string // DECIMAL(12, 2)
  platform_fee: string // DECIMAL(12, 2)
  seller_amount: string // DECIMAL(12, 2)
  currency: string
  status: TransactionStatus
  payment_id: string | null
  metadata: Record<string, unknown> | null
  created_at?: Date
  updated_at?: Date
}

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  'id' | 'currency' | 'status' | 'payment_id' | 'metadata' | 'created_at' | 'updated_at'
>

class Transaction extends Model<
  TransactionAttributes,
  TransactionCreationAttributes
> {
  declare id: string
  declare buyer_id: string
  declare seller_id: string
  declare listing_id: string
  declare amount: string
  declare platform_fee: string
  declare seller_amount: string
  declare currency: string
  declare status: TransactionStatus
  declare payment_id: string | null
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      buyerId: this.buyer_id,
      sellerId: this.seller_id,
      listingId: this.listing_id,
      amount: Number(this.amount),
      platformFee: Number(this.platform_fee),
      sellerAmount: Number(this.seller_amount),
      currency: this.currency,
      status: this.status,
      paymentId: this.payment_id,
      metadata: this.metadata,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    listing_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    platform_fee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    seller_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'ETB',
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'CANCELLED',
        'REFUNDED',
        'COMPLETED',
      ),
      allowNull: false,
      defaultValue: 'PENDING',
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
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_transactions_buyer_id', fields: ['buyer_id'] },
      { name: 'idx_transactions_seller_id', fields: ['seller_id'] },
      { name: 'idx_transactions_listing_id', fields: ['listing_id'] },
      { name: 'idx_transactions_status', fields: ['status'] },
      { name: 'idx_transactions_created_at', fields: ['created_at'] },
    ],
  },
)

export default Transaction
