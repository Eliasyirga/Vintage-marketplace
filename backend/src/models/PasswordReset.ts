import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { VerificationMethod } from '../types/auth.types'

interface PasswordResetAttributes {
  id: string
  user_id: string
  verification_method: VerificationMethod
  destination: string
  otp_hash: string
  otp_expires_at: Date
  otp_attempts: number
  is_used: boolean
  created_at?: Date
  updated_at?: Date
}

type PasswordResetCreationAttributes = Optional<
  PasswordResetAttributes,
  'id' | 'otp_attempts' | 'is_used' | 'created_at' | 'updated_at'
>

class PasswordReset extends Model<
  PasswordResetAttributes,
  PasswordResetCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare verification_method: VerificationMethod
  declare destination: string
  declare otp_hash: string
  declare otp_expires_at: Date
  declare otp_attempts: number
  declare is_used: boolean
  declare readonly created_at: Date
  declare readonly updated_at: Date

  get maskedDestination(): string {
    const dest = this.destination
    if (this.verification_method === 'EMAIL') {
      const [local, domain] = dest.split('@')
      return `${local.charAt(0)}***@${domain}`
    }
    return `${dest.slice(0, 4)} *** *** ${dest.slice(-3)}`
  }
}

PasswordReset.init(
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
    verification_method: {
      type: DataTypes.ENUM('EMAIL', 'PHONE'),
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING(320),
      allowNull: false,
    },
    otp_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    otp_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'password_resets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_password_resets_user_id', fields: ['user_id'] },
      { name: 'idx_password_resets_is_used', fields: ['is_used'] },
    ],
  },
)

export default PasswordReset
