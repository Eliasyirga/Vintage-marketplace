import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface AdminAuditLogAttributes {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  metadata: object | null
  created_at?: Date
}

type AdminAuditLogCreationAttributes = Optional<
  AdminAuditLogAttributes,
  'id' | 'reason' | 'metadata' | 'created_at'
>

class AdminAuditLog extends Model<AdminAuditLogAttributes, AdminAuditLogCreationAttributes> {
  declare id: string
  declare admin_id: string
  declare action: string
  declare target_type: string
  declare target_id: string
  declare reason: string | null
  declare metadata: object | null
  declare readonly created_at: Date
}

AdminAuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'admin_audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['admin_id'], name: 'idx_audit_admin_id' },
      { fields: ['target_type', 'target_id'], name: 'idx_audit_target' },
      { fields: ['created_at'], name: 'idx_audit_created_at' },
    ],
  },
)

export default AdminAuditLog
