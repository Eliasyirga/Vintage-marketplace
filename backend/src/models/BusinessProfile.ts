import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface BusinessProfileAttributes {
  id: string
  user_id: string
  business_name: string
  description: string | null
  logo: string | null
  business_phone: string | null
  business_email: string | null
  address: string | null
  city: string | null
  business_category: string | null
  tin_number: string | null
  registration_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  created_at?: Date
  updated_at?: Date
}

type BusinessProfileCreationAttributes = Optional<
  BusinessProfileAttributes,
  | 'id'
  | 'description'
  | 'logo'
  | 'business_phone'
  | 'business_email'
  | 'address'
  | 'city'
  | 'business_category'
  | 'tin_number'
  | 'registration_status'
  | 'created_at'
  | 'updated_at'
>

class BusinessProfile extends Model<
  BusinessProfileAttributes,
  BusinessProfileCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare business_name: string
  declare description: string | null
  declare logo: string | null
  declare business_phone: string | null
  declare business_email: string | null
  declare address: string | null
  declare city: string | null
  declare business_category: string | null
  declare tin_number: string | null
  declare registration_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      businessName: this.business_name,
      description: this.description,
      logo: this.logo,
      businessPhone: this.business_phone,
      businessEmail: this.business_email,
      address: this.address,
      city: this.city,
      businessCategory: this.business_category,
      registrationStatus: this.registration_status,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

BusinessProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    business_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    business_phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    business_email: {
      type: DataTypes.STRING(320),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    business_category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tin_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    registration_status: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'business_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_business_profiles_user_id', fields: ['user_id'], unique: true },
      { name: 'idx_business_profiles_status', fields: ['registration_status'] },
    ],
  },
)

export default BusinessProfile
