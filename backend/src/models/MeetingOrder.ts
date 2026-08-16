import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface MeetingOrderAttributes {
  id: string
  order_id: string
  meeting_location: string
  meeting_date: string
  meeting_time: string
  buyer_note: string | null
  seller_note: string | null
  buyer_confirmed: boolean
  seller_confirmed: boolean
  inspection_completed: boolean
  inspection_data: Record<string, unknown> | null
  completed_at: Date | null
  created_at?: Date
  updated_at?: Date
}

type MeetingOrderCreationAttributes = Optional<
  MeetingOrderAttributes,
  | 'id'
  | 'buyer_note'
  | 'seller_note'
  | 'buyer_confirmed'
  | 'seller_confirmed'
  | 'inspection_completed'
  | 'inspection_data'
  | 'completed_at'
  | 'created_at'
  | 'updated_at'
>

class MeetingOrder extends Model<
  MeetingOrderAttributes,
  MeetingOrderCreationAttributes
> {
  declare id: string
  declare order_id: string
  declare meeting_location: string
  declare meeting_date: string
  declare meeting_time: string
  declare buyer_note: string | null
  declare seller_note: string | null
  declare buyer_confirmed: boolean
  declare seller_confirmed: boolean
  declare inspection_completed: boolean
  declare inspection_data: Record<string, unknown> | null
  declare completed_at: Date | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      orderId: this.order_id,
      meetingLocation: this.meeting_location,
      meetingDate: this.meeting_date,
      meetingTime: this.meeting_time,
      buyerNote: this.buyer_note,
      sellerNote: this.seller_note,
      buyerConfirmed: this.buyer_confirmed,
      sellerConfirmed: this.seller_confirmed,
      inspectionCompleted: this.inspection_completed,
      inspectionData: this.inspection_data,
      completedAt: this.completed_at,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

MeetingOrder.init(
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
    meeting_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    meeting_date: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    meeting_time: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    buyer_note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    seller_note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    buyer_confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    seller_confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    inspection_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    inspection_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'meeting_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ name: 'idx_meeting_orders_order_id', fields: ['order_id'], unique: true }],
  },
)

export default MeetingOrder
