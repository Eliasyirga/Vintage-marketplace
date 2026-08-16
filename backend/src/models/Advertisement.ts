import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { AdPlacement, AdStatus } from '../types/monetization.types'

export interface AdvertisementAttributes {
  id: string
  advertiser_id: string
  plan_id: string | null
  title: string
  description: string | null
  image: string
  target_url: string
  placement: AdPlacement
  budget: string // DECIMAL(12, 2) — resolved from plan at creation time
  status: AdStatus
  payment_id: string | null
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: Date | null
  start_at: Date | null
  end_at: Date | null
  priority: number
  click_count: number
  impression_count: number
  created_at?: Date
  updated_at?: Date
}

type AdvertisementCreationAttributes = Optional<
  AdvertisementAttributes,
  | 'id'
  | 'plan_id'
  | 'description'
  | 'payment_id'
  | 'rejection_reason'
  | 'reviewed_by'
  | 'reviewed_at'
  | 'start_at'
  | 'end_at'
  | 'priority'
  | 'click_count'
  | 'impression_count'
  | 'status'
  | 'created_at'
  | 'updated_at'
>

class Advertisement extends Model<
  AdvertisementAttributes,
  AdvertisementCreationAttributes
> {
  declare id: string
  declare advertiser_id: string
  declare plan_id: string | null
  declare title: string
  declare description: string | null
  declare image: string
  declare target_url: string
  declare placement: AdPlacement
  declare budget: string
  declare status: AdStatus
  declare payment_id: string | null
  declare rejection_reason: string | null
  declare reviewed_by: string | null
  declare reviewed_at: Date | null
  declare start_at: Date | null
  declare end_at: Date | null
  declare priority: number
  declare click_count: number
  declare impression_count: number
  declare readonly created_at: Date
  declare readonly updated_at: Date

  isActive(): boolean {
    if (this.status !== 'ACTIVE') return false
    const now = Date.now()
    if (this.start_at && new Date(this.start_at).getTime() > now) return false
    if (this.end_at && new Date(this.end_at).getTime() < now) return false
    return true
  }

  toSafeObject() {
    return {
      id: this.id,
      advertiserId: this.advertiser_id,
      planId: this.plan_id,
      title: this.title,
      description: this.description,
      image: this.image,
      targetUrl: this.target_url,
      placement: this.placement,
      budget: Number(this.budget),
      status: this.status,
      paymentId: this.payment_id,
      rejectionReason: this.rejection_reason,
      reviewedBy: this.reviewed_by,
      reviewedAt: this.reviewed_at,
      startAt: this.start_at,
      endAt: this.end_at,
      priority: this.priority,
      clickCount: this.click_count,
      impressionCount: this.impression_count,
      ctr: this.impression_count > 0
        ? Number(((this.click_count / this.impression_count) * 100).toFixed(2))
        : 0,
      isActive: this.isActive(),
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Advertisement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    advertiser_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'monetization_plans', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    target_url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    placement: {
      type: DataTypes.ENUM(
        'HOME_TOP',
        'MARKETPLACE_MIDDLE',
        'MARKETPLACE_BOTTOM',
      ),
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM(
        'DRAFT',
        'PENDING_PAYMENT',
        'PENDING_REVIEW',
        'ACTIVE',
        'PAUSED',
        'REJECTED',
        'EXPIRED',
        'CANCELLED',
      ),
      allowNull: false,
      defaultValue: 'PENDING_PAYMENT',
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'payments', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    click_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    impression_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'advertisements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_advertisements_advertiser_id', fields: ['advertiser_id'] },
      { name: 'idx_advertisements_placement_status', fields: ['placement', 'status'] },
      { name: 'idx_advertisements_start_end', fields: ['start_at', 'end_at'] },
      {
        name: 'idx_advertisements_active_query',
        fields: ['status', 'placement', 'start_at', 'end_at'],
      },
      { name: 'idx_advertisements_priority', fields: ['priority'] },
      { name: 'idx_advertisements_plan_id', fields: ['plan_id'] },
    ],
  },
)

export default Advertisement
