import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { UserRole, UserStatus } from '../types/auth.types'

interface UserAttributes {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  password_hash: string
  role: UserRole
  status: UserStatus
  is_email_verified: boolean
  is_phone_verified: boolean
  is_fayda_verified: boolean
  is_face_verified: boolean
  avatar_url: string | null
  created_at?: Date
  updated_at?: Date
}

// id, timestamps are auto-generated
type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'role'
  | 'status'
  | 'is_email_verified'
  | 'is_phone_verified'
  | 'is_fayda_verified'
  | 'is_face_verified'
  | 'avatar_url'
  | 'email'
  | 'phone'
  | 'created_at'
  | 'updated_at'
>

class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: string
  declare full_name: string
  declare email: string | null
  declare phone: string | null
  declare password_hash: string
  declare role: UserRole
  declare status: UserStatus
  declare is_email_verified: boolean
  declare is_phone_verified: boolean
  declare is_fayda_verified: boolean
  declare is_face_verified: boolean
  declare avatar_url: string | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  /** Return a safe object safe to include in API responses */
  toSafeObject() {
    return {
      id: this.id,
      fullName: this.full_name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      status: this.status,
      isEmailVerified: this.is_email_verified,
      isPhoneVerified: this.is_phone_verified,
      isFaydaVerified: this.is_fayda_verified,
      isFaceVerified: this.is_face_verified,
      avatarUrl: this.avatar_url,
      createdAt: this.created_at,
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'USER',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'DEACTIVATED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_fayda_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_face_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    avatar_url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['email'], where: { email: { [require('sequelize').Op.ne]: null } } },
      { unique: true, fields: ['phone'], where: { phone: { [require('sequelize').Op.ne]: null } } },
    ],
  },
)

export default User
