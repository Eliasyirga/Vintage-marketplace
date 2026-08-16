import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type VerificationType = 'EMAIL' | 'PHONE' | 'NATIONAL_ID' | 'FACE' | 'BUSINESS'
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'PAID_PENDING' | 'VERIFIED' | 'REJECTED'

interface UserVerificationAttributes {
  id: string
  user_id: string
  verification_type: VerificationType
  status: VerificationStatus
  document_reference: string | null
  payment_id?: string | null
  verified_at: Date | null
  verified_by: string | null
  rejection_reason: string | null
  created_at?: Date
  updated_at?: Date
}

type UserVerificationCreationAttributes = Optional<
  UserVerificationAttributes,
  | 'id'
  | 'document_reference'
  | 'payment_id'
  | 'verified_at'
  | 'verified_by'
  | 'rejection_reason'
  | 'created_at'
  | 'updated_at'
>

class UserVerification extends Model<
  UserVerificationAttributes,
  UserVerificationCreationAttributes
> {
  declare id: string
  declare user_id: string
  declare verification_type: VerificationType
  declare status: VerificationStatus
  declare document_reference: string | null
  declare payment_id: string | null
  declare verified_at: Date | null
  declare verified_by: string | null
  declare rejection_reason: string | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      userId: this.user_id,
      verificationType: this.verification_type,
      status: this.status,
      paymentId: this.payment_id,
      verifiedAt: this.verified_at,
      rejectionReason: this.rejection_reason,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

UserVerification.init(
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
    verification_type: {
      type: DataTypes.ENUM('EMAIL', 'PHONE', 'NATIONAL_ID', 'FACE', 'BUSINESS'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('UNVERIFIED', 'PENDING', 'PAID_PENDING', 'VERIFIED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    document_reference: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'payments', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    rejection_reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_verifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_verifications_user_id',
      },
      {
        fields: ['status'],
        name: 'idx_verifications_status',
      },
      {
        fields: ['verification_type'],
        name: 'idx_verifications_type',
      },
      {
        unique: true,
        fields: ['user_id', 'verification_type'],
        name: 'idx_verifications_user_type_unique',
      },
    ],
  },
)

export default UserVerification
