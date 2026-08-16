import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type InteractionType =
  | 'VIEW'
  | 'FAVORITE'
  | 'CONTACT'
  | 'SEARCH'
  | 'CATEGORY'
  | 'NOT_INTERESTED'

interface UserInteractionAttributes {
  id: string
  user_id: string
  listing_id: string | null
  interaction_type: InteractionType
  metadata: Record<string, unknown> | null // e.g. { query: 'iPhone' } for SEARCH
  created_at?: Date
}

type UserInteractionCreationAttributes = Optional<
  UserInteractionAttributes,
  'id' | 'listing_id' | 'metadata' | 'created_at'
>

class UserInteraction extends Model<UserInteractionAttributes, UserInteractionCreationAttributes> {
  declare id: string
  declare user_id: string
  declare listing_id: string | null
  declare interaction_type: InteractionType
  declare metadata: Record<string, unknown> | null
  declare readonly created_at: Date
}

UserInteraction.init(
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
    listing_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'listings', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    interaction_type: {
      type: DataTypes.ENUM(
        'VIEW',
        'FAVORITE',
        'CONTACT',
        'SEARCH',
        'CATEGORY',
        'NOT_INTERESTED',
      ),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_interactions',
    timestamps: false,
    indexes: [
      { name: 'idx_ui_user_id', fields: ['user_id'] },
      { name: 'idx_ui_listing_id', fields: ['listing_id'] },
      { name: 'idx_ui_user_type', fields: ['user_id', 'interaction_type'] },
      { name: 'idx_ui_created_at', fields: ['created_at'] },
    ],
  },
)

export default UserInteraction;

