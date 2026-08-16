import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface ReviewAttributes {
  id: string
  reviewer_id: string
  seller_id: string
  listing_id: string
  rating: number
  comment: string
  created_at?: Date
  updated_at?: Date
}

type ReviewCreationAttributes = Optional<
  ReviewAttributes,
  'id' | 'created_at' | 'updated_at'
>

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> {
  declare id: string
  declare reviewer_id: string
  declare seller_id: string
  declare listing_id: string
  declare rating: number
  declare comment: string
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      reviewerId: this.reviewer_id,
      sellerId: this.seller_id,
      listingId: this.listing_id,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewer_id: {
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
    listing_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        isInt: true,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['reviewer_id', 'listing_id'],
        name: 'idx_reviews_reviewer_listing_unique',
      },
      {
        fields: ['seller_id'],
        name: 'idx_reviews_seller_id',
      },
      {
        fields: ['reviewer_id'],
        name: 'idx_reviews_reviewer_id',
      },
      {
        fields: ['listing_id'],
        name: 'idx_reviews_listing_id',
      },
      {
        fields: ['created_at'],
        name: 'idx_reviews_created_at',
      },
    ],
  },
)

export default Review
