import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface ConversationParticipantAttributes {
  id: string
  conversation_id: string
  user_id: string
  last_read_at: Date
  joined_at?: Date
  created_at?: Date
  updated_at?: Date
}

type ConversationParticipantCreationAttributes = Optional<
  ConversationParticipantAttributes,
  'id' | 'last_read_at' | 'joined_at' | 'created_at' | 'updated_at'
>

class ConversationParticipant extends Model<
  ConversationParticipantAttributes,
  ConversationParticipantCreationAttributes
> {
  declare id: string
  declare conversation_id: string
  declare user_id: string
  declare last_read_at: Date
  declare joined_at: Date
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      conversationId: this.conversation_id,
      userId: this.user_id,
      lastReadAt: this.last_read_at,
      joinedAt: this.joined_at,
      createdAt: this.created_at,
    }
  }
}

ConversationParticipant.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversation_participants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['conversation_id', 'user_id'],
        name: 'idx_conv_participants_unique',
      },
      {
        fields: ['user_id'],
        name: 'idx_conv_participants_user_id',
      },
      {
        fields: ['conversation_id'],
        name: 'idx_conv_participants_conv_id',
      },
    ],
  },
)

export default ConversationParticipant
