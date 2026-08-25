import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type ReportTargetType = 'LISTING' | 'USER' | 'REVIEW' | 'MESSAGE' | 'CONVERSATION'
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface ReportAttributes {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  description: string | null
  status: ReportStatus
  priority: ReportPriority
  admin_note: string | null
  resolved_by: string | null
  resolved_at: Date | null
  created_at?: Date
  updated_at?: Date
}

type ReportCreationAttributes = Optional<
  ReportAttributes,
  | 'id'
  | 'description'
  | 'status'
  | 'priority'
  | 'admin_note'
  | 'resolved_by'
  | 'resolved_at'
  | 'created_at'
  | 'updated_at'
>

class Report extends Model<ReportAttributes, ReportCreationAttributes> {
  declare id: string
  declare reporter_id: string
  declare target_type: ReportTargetType
  declare target_id: string
  declare reason: string
  declare description: string | null
  declare status: ReportStatus
  declare priority: ReportPriority
  declare admin_note: string | null
  declare resolved_by: string | null
  declare resolved_at: Date | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      reporterId: this.reporter_id,
      targetType: this.target_type,
      targetId: this.target_id,
      reason: this.reason,
      description: this.description,
      status: this.status,
      priority: this.priority,
      adminNote: this.admin_note,
      resolvedBy: this.resolved_by,
      resolvedAt: this.resolved_at,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    }
  }
}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    target_type: {
      type: DataTypes.ENUM('LISTING', 'USER', 'REVIEW', 'MESSAGE', 'CONVERSATION'),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
      defaultValue: 'MEDIUM',
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['reporter_id'],
        name: 'idx_reports_reporter_id',
      },
      {
        fields: ['target_type', 'target_id'],
        name: 'idx_reports_target',
      },
      {
        fields: ['status'],
        name: 'idx_reports_status',
      },
      {
        fields: ['priority'],
        name: 'idx_reports_priority',
      },
      {
        fields: ['created_at'],
        name: 'idx_reports_created_at',
      },
    ],
  },
)

export default Report
