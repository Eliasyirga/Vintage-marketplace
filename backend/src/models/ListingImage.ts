import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import { env } from '../config/env'

interface ListingImageAttributes {
  id: string
  listing_id: string
  url: string        // Cloudinary secure_url or legacy local path
  public_id: string | null  // Cloudinary public_id (used for deletion / transforms)
  alt_text: string | null
  sort_order: number
  is_cover: boolean
  width: number | null
  height: number | null
  format: string | null
  bytes: number | null
  created_at?: Date
  updated_at?: Date
}

type ListingImageCreationAttributes = Optional<
  ListingImageAttributes,
  | 'id'
  | 'public_id'
  | 'alt_text'
  | 'sort_order'
  | 'is_cover'
  | 'width'
  | 'height'
  | 'format'
  | 'bytes'
  | 'created_at'
  | 'updated_at'
>

class ListingImage extends Model<ListingImageAttributes, ListingImageCreationAttributes> {
  declare id: string
  declare listing_id: string
  declare url: string
  declare public_id: string | null
  declare alt_text: string | null
  declare sort_order: number
  declare is_cover: boolean
  declare width: number | null
  declare height: number | null
  declare format: string | null
  declare bytes: number | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    // Sanitize legacy localhost URLs (stored during dev/seeding without Cloudinary)
    // so the API always returns a publicly-accessible URL
    let safeUrl = this.url
    if (safeUrl && safeUrl.includes('localhost:5000')) {
      safeUrl = safeUrl.replace('http://localhost:5000', env.API_PUBLIC_URL)
    }
    return {
      id: this.id,
      url: safeUrl,
      altText: this.alt_text,
      sortOrder: this.sort_order,
      isCover: this.is_cover,
      width: this.width,
      height: this.height,
      format: this.format,
      bytes: this.bytes,
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
    is_cover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    bytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'listing_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['listing_id'] },
      { fields: ['listing_id', 'sort_order'] },
      { fields: ['listing_id', 'is_cover'] },
    ],
  },
)

export default ListingImage
