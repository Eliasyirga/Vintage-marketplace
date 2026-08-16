import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface FavoriteAttributes {
  id: string
  user_id: string
  listing_id: string
  created_at?: Date
}

type FavoriteCreationAttributes = Optional<FavoriteAttributes, 'id' | 'created_at'>

class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> {
  declare id: string
  declare user_id: string
  declare listing_id: string
  declare readonly created_at: Date

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      listingId: this.listing_id,
      createdAt: this.created_at,
    }
  }
}

Favorite.init(
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
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'favorites',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'listing_id'],
        name: 'idx_favorites_user_listing_unique',
      },
      {
        fields: ['user_id'],
        name: 'idx_favorites_user_id',
      },
      {
        fields: ['listing_id'],
        name: 'idx_favorites_listing_id',
      },
    ],
  },
)

export default Favorite
