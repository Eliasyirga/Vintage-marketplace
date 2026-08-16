import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { PlanType, BillingCycle } from '../types/monetization.types'

export interface PlanAttributes {
  id: string
  name: string
  type: PlanType
  price: string // DECIMAL(12, 2)
  currency: string
  duration_days: number
  billing_cycle: BillingCycle
  features: string[] // List of feature keys or bullets
  is_active: boolean
  sort_order: number
  created_at?: Date
  updated_at?: Date
}

type PlanCreationAttributes = Optional<
  PlanAttributes,
  'id' | 'currency' | 'billing_cycle' | 'features' | 'is_active' | 'sort_order' | 'created_at' | 'updated_at'
>

class Plan extends Model<PlanAttributes, PlanCreationAttributes> {
  declare id: string
  declare name: string
  declare type: PlanType
  declare price: string
  declare currency: string
  declare duration_days: number
  declare billing_cycle: BillingCycle
  declare features: string[]
  declare is_active: boolean
  declare sort_order: number
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      price: Number(this.price),
      currency: this.currency,
      durationDays: this.duration_days,
      billingCycle: this.billing_cycle,
      features: this.features,
      isActive: this.is_active,
      sortOrder: this.sort_order,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Plan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'FEATURED',
        'BOOST',
        'PREMIUM',
        'BUSINESS',
        'VERIFICATION',
        'ADVERTISEMENT',
      ),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'ETB',
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
    },
    billing_cycle: {
      type: DataTypes.ENUM('ONE_TIME', 'MONTHLY', 'YEARLY'),
      allowNull: false,
      defaultValue: 'ONE_TIME',
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'monetization_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_plans_type_active', fields: ['type', 'is_active'] },
      { name: 'idx_plans_sort_order', fields: ['sort_order'] },
    ],
  },
)

export default Plan
