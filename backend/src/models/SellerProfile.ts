import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface SellerProfileAttributes {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  profile_image: string | null
  city: string | null
  sub_city: string | null
  neighborhood: string | null
  created_at?: Date
  updated_at?: Date
}

type SellerProfileCreationAttributes = Optional<
  SellerProfileAttributes,
  | 'id'
  | 'display_name'
  | 'bio'
  | 'profile_image'
  | 'city'
  | 'sub_city'
  | 'neighborhood'
  | 'created_at'
  | 'updated_at'
>

class SellerProfile extends Model<
  SellerProfileAttributes,
  SellerProfileCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare display_name: string | null
  declare bio: string | null
  declare profile_image: string | null
  declare city: string | null
  declare sub_city: string | null
  declare neighborhood: string | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  /** Return a safe object for inclusion in public API responses. */
  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      displayName: this.display_name,
      bio: this.bio,
      profileImage: this.profile_image,
      city: this.city,
      subCity: this.sub_city,
      neighborhood: this.neighborhood,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

SellerProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // one profile per user
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    display_name: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    bio: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sub_city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'seller_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['user_id'] },
      { fields: ['city'] },
    ],
  },
)

export default SellerProfile
