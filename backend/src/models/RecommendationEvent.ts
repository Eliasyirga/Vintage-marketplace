import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type RecommendationEventType = "IMPRESSION" | "CLICK";

interface RecommendationEventAttributes {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  event_type: RecommendationEventType;
  context: string | null;
  created_at?: Date;
}

type RecommendationEventCreationAttributes = Optional<
  RecommendationEventAttributes,
  "id" | "user_id" | "listing_id" | "context" | "created_at"
>;

class RecommendationEvent extends Model<
  RecommendationEventAttributes,
  RecommendationEventCreationAttributes
> {
  declare id: string;
  declare user_id: string | null;
  declare listing_id: string | null;
  declare event_type: RecommendationEventType;
  declare context: string | null;
  declare readonly created_at: Date;
}

RecommendationEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    listing_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "listings", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    event_type: {
      type: DataTypes.ENUM("IMPRESSION", "CLICK"),
      allowNull: false,
    },
    context: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "recommendation_events",
    timestamps: false,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["listing_id"] },
      { fields: ["event_type"] },
      { fields: ["created_at"] },
    ],
  },
);

export default RecommendationEvent;
