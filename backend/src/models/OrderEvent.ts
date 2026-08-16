import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { OrderEventType } from '../types/order.types'

export interface OrderEventAttributes {
  id: string
  order_id: string
  actor_id: string | null
  event_type: OrderEventType
  description: string
  metadata: Record<string, unknown> | null
  created_at?: Date
}

type OrderEventCreationAttributes = Optional<
  OrderEventAttributes,
  'id' | 'actor_id' | 'metadata' | 'created_at'
>

class OrderEvent extends Model<
  OrderEventAttributes,
  OrderEventCreationAttributes
> {
  declare id: string
  declare order_id: string
  declare actor_id: string | null
  declare event_type: OrderEventType
  declare description: string
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date

  toSafeObject() {
    return {
      id: this.id,
      orderId: this.order_id,
      actorId: this.actor_id,
      eventType: this.event_type,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.created_at,
    }
  }
}

OrderEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'orders', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    actor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    event_type: {
      type: DataTypes.ENUM(
        'ORDER_CREATED',
        'PAYMENT_INITIALIZED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'SELLER_CONFIRMED',
        'SELLER_REJECTED',
        'MEETING_REQUESTED',
        'MEETING_CONFIRMED',
        'MEETING_RESCHEDULED',
        'ITEM_READY',
        'DELIVERY_REQUESTED',
        'PICKED_UP',
        'DELIVERED',
        'INSPECTION_COMPLETED',
        'BUYER_CONFIRMED',
        'ORDER_COMPLETED',
        'ORDER_CANCELLED',
        'REFUND_REQUESTED',
        'REFUND_COMPLETED',
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'order_events',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    indexes: [
      { name: 'idx_order_events_order_id', fields: ['order_id'] },
      { name: 'idx_order_events_created_at', fields: ['created_at'] },
    ],
  },
)

export default OrderEvent
