import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type {
  FulfillmentMethod,
  PaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from '../types/order.types'

export interface OrderAttributes {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  listing_id: string
  item_price: string // DECIMAL(12, 2)
  delivery_fee: string // DECIMAL(12, 2)
  platform_fee: string // DECIMAL(12, 2)
  seller_amount: string // DECIMAL(12, 2)
  total_amount: string // DECIMAL(12, 2)
  currency: string
  fulfillment_method: FulfillmentMethod
  payment_method: PaymentMethod
  payment_status: OrderPaymentStatus
  status: OrderStatus
  reservation_expires_at: Date | null
  metadata: Record<string, unknown> | null
  created_at?: Date
  updated_at?: Date
}

type OrderCreationAttributes = Optional<
  OrderAttributes,
  | 'id'
  | 'delivery_fee'
  | 'platform_fee'
  | 'seller_amount'
  | 'currency'
  | 'payment_method'
  | 'payment_status'
  | 'status'
  | 'reservation_expires_at'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>

class Order extends Model<OrderAttributes, OrderCreationAttributes> {
  declare id: string
  declare order_number: string
  declare buyer_id: string
  declare seller_id: string
  declare listing_id: string
  declare item_price: string
  declare delivery_fee: string
  declare platform_fee: string
  declare seller_amount: string
  declare total_amount: string
  declare currency: string
  declare fulfillment_method: FulfillmentMethod
  declare payment_method: PaymentMethod
  declare payment_status: OrderPaymentStatus
  declare status: OrderStatus
  declare reservation_expires_at: Date | null
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      orderNumber: this.order_number,
      buyerId: this.buyer_id,
      sellerId: this.seller_id,
      listingId: this.listing_id,
      itemPrice: Number(this.item_price),
      deliveryFee: Number(this.delivery_fee),
      platformFee: Number(this.platform_fee),
      sellerAmount: Number(this.seller_amount),
      totalAmount: Number(this.total_amount),
      currency: this.currency,
      fulfillmentMethod: this.fulfillment_method,
      paymentMethod: this.payment_method,
      paymentStatus: this.payment_status,
      status: this.status,
      reservationExpiresAt: this.reservation_expires_at,
      metadata: this.metadata,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
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
    item_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
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
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'ETB',
    },
    fulfillment_method: {
      type: DataTypes.ENUM('DELIVERY', 'MEET_IN_PERSON'),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('PLATFORM_PAYMENT', 'DIRECT_TO_SELLER'),
      allowNull: false,
      defaultValue: 'PLATFORM_PAYMENT',
    },
    payment_status: {
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
    status: {
      type: DataTypes.ENUM(
        'PENDING_PAYMENT',
        'PAID',
        'SELLER_CONFIRMATION_REQUIRED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_DELIVERY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'MEETING_REQUESTED',
        'MEETING_CONFIRMED',
        'INSPECTION_PENDING',
        'COMPLETED',
        'CANCELLED',
        'REFUND_REQUESTED',
        'REFUNDED',
      ),
      allowNull: false,
      defaultValue: 'PENDING_PAYMENT',
    },
    reservation_expires_at: {
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
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_orders_order_number', fields: ['order_number'], unique: true },
      { name: 'idx_orders_buyer_id', fields: ['buyer_id'] },
      { name: 'idx_orders_seller_id', fields: ['seller_id'] },
      { name: 'idx_orders_listing_id', fields: ['listing_id'] },
      { name: 'idx_orders_status', fields: ['status'] },
      { name: 'idx_orders_created_at', fields: ['created_at'] },
    ],
  },
)

export default Order
