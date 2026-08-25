/**
 * AdvertisementEvent — tracks individual impression and click events for ads.
 *
 * Deduplicated per (advertisement_id, event_type, ip_hash) within a 24-hour window
 * at the service layer to prevent blind increment abuse.
 *
 * Data is stored for analytics aggregation and CTR/reach reporting.
 */

import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type AdEventType = 'IMPRESSION' | 'CLICK'

interface AdvertisementEventAttributes {
  id: string
  advertisement_id: string
  event_type: AdEventType
  session_id: string | null  // Anonymous browser session token
  user_id: string | null     // Authenticated user if known
  ip_hash: string | null     // SHA-256 hash of IP — never stores raw IP
  created_at?: Date
}

type AdvertisementEventCreationAttributes = Optional<
  AdvertisementEventAttributes,
  'id' | 'session_id' | 'user_id' | 'ip_hash' | 'created_at'
>

class AdvertisementEvent extends Model<
  AdvertisementEventAttributes,
  AdvertisementEventCreationAttributes
> {
  declare id: string
  declare advertisement_id: string
  declare event_type: AdEventType
  declare session_id: string | null
  declare user_id: string | null
  declare ip_hash: string | null
  declare readonly created_at: Date
}

AdvertisementEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    advertisement_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'advertisements', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    event_type: {
      type: DataTypes.ENUM('IMPRESSION', 'CLICK'),
      allowNull: false,
    },
    session_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    ip_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'advertisement_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { name: 'idx_ad_events_ad_id', fields: ['advertisement_id'] },
      {
        name: 'idx_ad_events_type_created',
        fields: ['event_type', 'created_at'],
      },
      {
        name: 'idx_ad_events_dedup',
        fields: ['advertisement_id', 'event_type', 'ip_hash'],
      },
    ],
  },
)

export default AdvertisementEvent
