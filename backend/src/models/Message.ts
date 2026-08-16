import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface MessageAttributes {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at?: Date
}

type MessageCreationAttributes = Optional<
  MessageAttributes,
  'id' | 'is_read' | 'created_at'
>

class Message extends Model<MessageAttributes, MessageCreationAttributes> {
  declare id: string
  declare conversation_id: string
  declare sender_id: string
  declare content: string
  declare is_read: boolean
  declare readonly created_at: Date

  toSafeObject() {
    return {
      id: this.id,
      conversationId: this.conversation_id,
      senderId: this.sender_id,
      content: this.content,
      isRead: this.is_read,
      createdAt: this.created_at,
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
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: false,
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
    ],
  },
)

export default Message
