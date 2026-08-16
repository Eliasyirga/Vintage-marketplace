import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface RecentlyViewedAttributes {
  id: string
  user_id: string
  listing_id: string
  viewed_at: Date
}

type RecentlyViewedCreationAttributes = Optional<
  RecentlyViewedAttributes,
  'id' | 'viewed_at'
>

class RecentlyViewed extends Model<
  RecentlyViewedAttributes,
  RecentlyViewedCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare listing_id: string
  declare viewed_at: Date

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      listingId: this.listing_id,
      viewedAt: this.viewed_at,
    }
  }
}

RecentlyViewed.init(
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
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'recently_viewed',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'listing_id'],
        name: 'idx_recently_viewed_user_listing_unique',
      },
      {
        fields: ['user_id'],
        name: 'idx_recently_viewed_user_id',
      },
      {
        fields: ['listing_id'],
        name: 'idx_recently_viewed_listing_id',
      },
      {
        fields: ['viewed_at'],
        name: 'idx_recently_viewed_viewed_at',
      },
    ],
  },
)

export default RecentlyViewed
