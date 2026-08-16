import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import type { VerificationMethod } from '../types/auth.types'

interface PendingRegistrationAttributes {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  password_hash: string
  verification_method: VerificationMethod
  otp_hash: string
  otp_expires_at: Date
  otp_attempts: number
  otp_send_count: number
  last_otp_sent_at: Date
  created_at?: Date
  updated_at?: Date
}

type PendingRegistrationCreationAttributes = Optional<
  PendingRegistrationAttributes,
  'id' | 'otp_attempts' | 'otp_send_count' | 'email' | 'phone' | 'created_at' | 'updated_at'
>

class PendingRegistration extends Model<
  PendingRegistrationAttributes,
  PendingRegistrationCreationAttributes
> {
  declare id: string
  declare full_name: string
  declare email: string | null
  declare phone: string | null
  declare password_hash: string
  declare verification_method: VerificationMethod
  declare otp_hash: string
  declare otp_expires_at: Date
  declare otp_attempts: number
  declare otp_send_count: number
  declare last_otp_sent_at: Date
  declare readonly created_at: Date
  declare readonly updated_at: Date

  get destination(): string {
    return this.verification_method === 'EMAIL'
      ? (this.email ?? '')
      : (this.phone ?? '')
  }

  /** Mask destination for safe display in API responses */
  get maskedDestination(): string {
    const dest = this.destination
    if (this.verification_method === 'EMAIL') {
      const [local, domain] = dest.split('@')
      return `${local.charAt(0)}***@${domain}`
    }
    // Phone: show last 3 digits only e.g. +251 *** *** 123
    return `${dest.slice(0, 4)} *** *** ${dest.slice(-3)}`
  }
}

PendingRegistration.init(
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
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    verification_method: {
      type: DataTypes.ENUM('EMAIL', 'PHONE'),
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
    otp_send_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    last_otp_sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'pending_registrations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

export default PendingRegistration
