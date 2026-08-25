import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type MessageType = 'TEXT' | 'SYSTEM'

export interface MessageAttributes {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  is_read: boolean
  deleted_at: Date | null
  created_at?: Date
  updated_at?: Date
}

type MessageCreationAttributes = Optional<
  MessageAttributes,
  'id' | 'message_type' | 'is_read' | 'deleted_at' | 'created_at' | 'updated_at'
>

class Message extends Model<MessageAttributes, MessageCreationAttributes> {
  declare id: string
  declare conversation_id: string
  declare sender_id: string
  declare content: string
  declare message_type: MessageType
  declare is_read: boolean
  declare deleted_at: Date | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      conversationId: this.conversation_id,
      senderId: this.sender_id,
      content: this.deleted_at ? 'This message was deleted.' : this.content,
      messageType: this.message_type,
      isRead: this.is_read,
      isDeleted: !!this.deleted_at,
      deletedAt: this.deleted_at,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'conversations', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('TEXT', 'SYSTEM'),
      allowNull: false,
      defaultValue: 'TEXT',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false, // We handle soft-deletion explicitly to show "This message was deleted"
    indexes: [
      {
        fields: ['conversation_id'],
        name: 'idx_messages_conversation_id',
      },
      {
        fields: ['sender_id'],
        name: 'idx_messages_sender_id',
      },
      {
        fields: ['created_at'],
        name: 'idx_messages_created_at',
      },
      {
        fields: ['conversation_id', 'created_at'],
        name: 'idx_messages_conv_created',
      },
    ],
  },
)

export default Message
