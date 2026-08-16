import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface NotificationAttributes {
  id: string
  user_id: string
  title: string
  message: string
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'MEETING' | 'SYSTEM'
  link: string | null
  is_read: boolean
  metadata: Record<string, unknown> | null
  created_at?: Date
  updated_at?: Date
}

type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'link' | 'is_read' | 'metadata' | 'created_at' | 'updated_at'
>

class Notification extends Model<
  NotificationAttributes,
  NotificationCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare title: string
  declare message: string
  declare type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'MEETING' | 'SYSTEM'
  declare link: string | null
  declare is_read: boolean
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      title: this.title,
      message: this.message,
      type: this.type,
      link: this.link,
      isRead: this.is_read,
      metadata: this.metadata,
      createdAt: this.created_at,
    }
  }
}

Notification.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('ORDER', 'PAYMENT', 'DELIVERY', 'MEETING', 'SYSTEM'),
      allowNull: false,
      defaultValue: 'ORDER',
    },
    link: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_notifications_user_id', fields: ['user_id'] },
      { name: 'idx_notifications_is_read', fields: ['is_read'] },
      { name: 'idx_notifications_created_at', fields: ['created_at'] },
    ],
  },
)

export default Notification
