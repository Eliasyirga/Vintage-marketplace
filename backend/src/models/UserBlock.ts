import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface UserBlockAttributes {
  id: string
  blocker_id: string
  blocked_user_id: string
  created_at?: Date
}

type UserBlockCreationAttributes = Optional<UserBlockAttributes, 'id' | 'created_at'>

class UserBlock extends Model<UserBlockAttributes, UserBlockCreationAttributes> {
  declare id: string
  declare blocker_id: string
  declare blocked_user_id: string
  declare readonly created_at: Date

  toSafeObject() {
    return {
      id: this.id,
      blockerId: this.blocker_id,
      blockedUserId: this.blocked_user_id,
      createdAt: this.created_at,
    }
  }
}

UserBlock.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blocker_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    blocked_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'user_blocks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['blocker_id', 'blocked_user_id'],
        name: 'idx_user_blocks_unique',
      },
      {
        fields: ['blocker_id'],
        name: 'idx_user_blocks_blocker_id',
      },
      {
        fields: ['blocked_user_id'],
        name: 'idx_user_blocks_blocked_id',
      },
    ],
  },
)

export default UserBlock
