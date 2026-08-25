import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { PaymentPurpose, PaymentStatus, PaymentProviderName } from '../types/monetization.types'

export interface PaymentAttributes {
  id: string
  user_id: string
  order_id: string | null
  reference: string
  provider: PaymentProviderName
  provider_reference: string | null
  amount: string // DECIMAL(12, 2)
  currency: string
  purpose: PaymentPurpose
  status: PaymentStatus
  metadata: Record<string, unknown> | null
  paid_at: Date | null
  created_at?: Date
  updated_at?: Date
}

type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  | 'id'
  | 'order_id'
  | 'provider_reference'
  | 'currency'
  | 'status'
  | 'metadata'
  | 'paid_at'
  | 'created_at'
  | 'updated_at'
>

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> {
  declare id: string
  declare user_id: string
  declare order_id: string | null
  declare reference: string
  declare provider: PaymentProviderName
  declare provider_reference: string | null
  declare amount: string
  declare currency: string
  declare purpose: PaymentPurpose
  declare status: PaymentStatus
  declare metadata: Record<string, unknown> | null
  declare paid_at: Date | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      orderId: this.order_id,
      reference: this.reference,
      provider: this.provider,
      providerReference: this.provider_reference,
      amount: Number(this.amount),
      currency: this.currency,
      purpose: this.purpose,
      status: this.status,
      metadata: this.metadata,
      paidAt: this.paid_at,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Payment.init(
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
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'orders', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    provider: {
      type: DataTypes.ENUM('MOCK', 'CHAPA', 'TELEBIRR'),
      allowNull: false,
      defaultValue: 'MOCK',
    },
    provider_reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'ETB',
    },
    purpose: {
      type: DataTypes.ENUM(
        'FEATURED_LISTING',
        'LISTING_BOOST',
        'BUSINESS_SUBSCRIPTION',
        'PREMIUM_SUBSCRIPTION',
        'VERIFICATION',
        'ADVERTISEMENT',
        'TRANSACTION_FEE',
        'DELIVERY',
        'ORDER_PURCHASE',
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'PROCESSING',
        'SUCCESS',
        'FAILED',
        'CANCELLED',
        'REFUNDED',
      ),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_payments_user_id', fields: ['user_id'] },
      { name: 'idx_payments_order_id', fields: ['order_id'] },
      { name: 'idx_payments_reference', fields: ['reference'], unique: true },
      { name: 'idx_payments_status', fields: ['status'] },
      { name: 'idx_payments_purpose', fields: ['purpose'] },
      { name: 'idx_payments_created_at', fields: ['created_at'] },
    ],
  },
)

export default Payment
