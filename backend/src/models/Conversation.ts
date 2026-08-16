import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface ConversationAttributes {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  last_message_at: Date
  created_at?: Date
  updated_at?: Date
}

type ConversationCreationAttributes = Optional<
  ConversationAttributes,
  'id' | 'last_message_at' | 'created_at' | 'updated_at'
>

class Conversation extends Model<
  ConversationAttributes,
  ConversationCreationAttributes
> {
  declare id: string
  declare listing_id: string
  declare buyer_id: string
  declare seller_id: string
  declare last_message_at: Date
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      listingId: this.listing_id,
      buyerId: this.buyer_id,
      sellerId: this.seller_id,
      lastMessageAt: this.last_message_at,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listing_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['listing_id', 'buyer_id'],
        name: 'idx_conversations_listing_buyer_unique',
      },
      {
        fields: ['buyer_id'],
        name: 'idx_conversations_buyer_id',
      },
      {
        fields: ['seller_id'],
        name: 'idx_conversations_seller_id',
      },
      {
        fields: ['last_message_at'],
        name: 'idx_conversations_last_message_at',
      },
    ],
  },
)

export default Conversation
