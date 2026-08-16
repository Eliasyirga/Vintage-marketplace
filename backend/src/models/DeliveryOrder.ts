import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { DeliveryStatus } from '../types/order.types'

export interface DeliveryOrderAttributes {
  id: string
  order_id: string
  provider_id: string | null
  recipient_name: string
  recipient_phone: string
  city: string
  sub_city: string
  neighborhood: string | null
  delivery_location: string
  delivery_notes: string | null
  delivery_fee: string // DECIMAL(12, 2)
  platform_commission: string // DECIMAL(12, 2)
  status: DeliveryStatus
  tracking_reference: string | null
  estimated_delivery_at: Date | null
  picked_up_at: Date | null
  delivered_at: Date | null
  metadata: Record<string, unknown> | null
  created_at?: Date
  updated_at?: Date
}

type DeliveryOrderCreationAttributes = Optional<
  DeliveryOrderAttributes,
  | 'id'
  | 'provider_id'
  | 'neighborhood'
  | 'delivery_notes'
  | 'platform_commission'
  | 'status'
  | 'tracking_reference'
  | 'estimated_delivery_at'
  | 'picked_up_at'
  | 'delivered_at'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>

class DeliveryOrder extends Model<
  DeliveryOrderAttributes,
  DeliveryOrderCreationAttributes
> {
  declare id: string
  declare order_id: string
  declare provider_id: string | null
  declare recipient_name: string
  declare recipient_phone: string
  declare city: string
  declare sub_city: string
  declare neighborhood: string | null
  declare delivery_location: string
  declare delivery_notes: string | null
  declare delivery_fee: string
  declare platform_commission: string
  declare status: DeliveryStatus
  declare tracking_reference: string | null
  declare estimated_delivery_at: Date | null
  declare picked_up_at: Date | null
  declare delivered_at: Date | null
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      orderId: this.order_id,
      providerId: this.provider_id,
      recipientName: this.recipient_name,
      recipientPhone: this.recipient_phone,
      city: this.city,
      subCity: this.sub_city,
      neighborhood: this.neighborhood,
      deliveryLocation: this.delivery_location,
      deliveryNotes: this.delivery_notes,
      deliveryFee: Number(this.delivery_fee),
      platformCommission: Number(this.platform_commission),
      status: this.status,
      trackingReference: this.tracking_reference,
      estimatedDeliveryAt: this.estimated_delivery_at,
      pickedUpAt: this.picked_up_at,
      deliveredAt: this.delivered_at,
      metadata: this.metadata,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

DeliveryOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'orders', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    provider_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recipient_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    recipient_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sub_city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    delivery_location: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    delivery_notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    platform_commission: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM(
        'REQUESTED',
        'ACCEPTED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED',
      ),
      allowNull: false,
      defaultValue: 'REQUESTED',
    },
    tracking_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estimated_delivery_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    picked_up_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'delivery_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_delivery_orders_order_id', fields: ['order_id'], unique: true },
      { name: 'idx_delivery_orders_status', fields: ['status'] },
      { name: 'idx_delivery_orders_tracking', fields: ['tracking_reference'] },
    ],
  },
)

export default DeliveryOrder
