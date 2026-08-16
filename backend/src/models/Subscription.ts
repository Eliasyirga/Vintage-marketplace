import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { SubscriptionStatus } from '../types/monetization.types'

export interface SubscriptionAttributes {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  start_at: Date
  expires_at: Date
  payment_id: string | null
  auto_renew: boolean
  created_at?: Date
  updated_at?: Date
}

type SubscriptionCreationAttributes = Optional<
  SubscriptionAttributes,
  'id' | 'status' | 'payment_id' | 'auto_renew' | 'created_at' | 'updated_at'
>

class Subscription extends Model<
  SubscriptionAttributes,
  SubscriptionCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare plan_id: string
  declare status: SubscriptionStatus
  declare start_at: Date
  declare expires_at: Date
  declare payment_id: string | null
  declare auto_renew: boolean
  declare readonly created_at: Date
  declare readonly updated_at: Date

  isActive(): boolean {
    if (this.status !== 'ACTIVE') return false
    return new Date(this.expires_at).getTime() > Date.now()
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      planId: this.plan_id,
      status: this.status,
      startAt: this.start_at,
      expiresAt: this.expires_at,
      paymentId: this.payment_id,
      autoRenew: this.auto_renew,
      isActive: this.isActive(),
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Subscription.init(
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
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'monetization_plans', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'payments', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_subscriptions_user_id', fields: ['user_id'] },
      { name: 'idx_subscriptions_plan_id', fields: ['plan_id'] },
      { name: 'idx_subscriptions_status_expires', fields: ['status', 'expires_at'] },
    ],
  },
)

export default Subscription
