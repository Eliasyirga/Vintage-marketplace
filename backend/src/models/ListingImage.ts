import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface ListingImageAttributes {
  id: string
  listing_id: string
  url: string
  public_id: string | null
  alt_text: string | null
  sort_order: number
  created_at?: Date
}

type ListingImageCreationAttributes = Optional<
  ListingImageAttributes,
  'id' | 'public_id' | 'alt_text' | 'sort_order' | 'created_at'
>

class ListingImage extends Model<ListingImageAttributes, ListingImageCreationAttributes> {
  declare id: string
  declare listing_id: string
  declare url: string
  declare public_id: string | null
  declare alt_text: string | null
  declare sort_order: number
  declare readonly created_at: Date

  toSafeObject() {
    return {
      id: this.id,
      url: this.url,
      altText: this.alt_text,
      sortOrder: this.sort_order,
    }
  }
}

ListingImage.init(
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
    url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'listing_images',
    timestamps: false,
    indexes: [{ fields: ['listing_id'] }, { fields: ['listing_id', 'sort_order'] }],
  },
)

export default ListingImage
