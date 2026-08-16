import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import type { ListingCondition, ListingStatus } from "../types/listing.types";

interface ListingAttributes {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: string;
  condition: ListingCondition;
  city: string;
  sub_city: string | null;
  neighborhood: string | null;
  status: ListingStatus;
  view_count: number;
  favorite_count: number;
  contact_count: number;
  published_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type ListingCreationAttributes = Optional<
  ListingAttributes,
  | "id"
  | "sub_city"
  | "neighborhood"
  | "status"
  | "view_count"
  | "favorite_count"
  | "contact_count"
  | "published_at"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

class Listing extends Model<ListingAttributes, ListingCreationAttributes> {
  declare id: string;
  declare seller_id: string;
  declare category_id: string;
  declare title: string;
  declare description: string;
  declare price: string;
  declare condition: ListingCondition;
  declare city: string;
  declare sub_city: string | null;
  declare neighborhood: string | null;
  declare status: ListingStatus;
  declare view_count: number;
  declare favorite_count: number;
  declare contact_count: number;
  declare published_at: Date | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare deleted_at: Date | null;
}

Listing.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "categories", key: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    condition: {
      type: DataTypes.ENUM(
        "BRAND_NEW",
        "LIKE_NEW",
        "LIGHTLY_USED",
        "FAIR",
        "HEAVILY_USED",
      ),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sub_city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "ACTIVE", "RESERVED", "SOLD", "ARCHIVED", "REMOVED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    favorite_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    contact_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "listings",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
      { name: "idx_listings_seller_id", fields: ["seller_id"] },
      { name: "idx_listings_category_id", fields: ["category_id"] },
      { name: "idx_listings_status", fields: ["status"] },
      { name: "idx_listings_condition", fields: ["condition"] },
      { name: "idx_listings_city", fields: ["city"] },
      { name: "idx_listings_sub_city", fields: ["sub_city"] },
      { name: "idx_listings_neighborhood", fields: ["neighborhood"] },
      { name: "idx_listings_price", fields: ["price"] },
      { name: "idx_listings_created_at", fields: ["created_at"] },
      { name: "idx_listings_view_count", fields: ["view_count"] },
      { name: "idx_listings_favorite_count", fields: ["favorite_count"] },
      { name: "idx_listings_contact_count", fields: ["contact_count"] },
      {
        name: "idx_listings_status_category",
        fields: ["status", "category_id"],
      },
      { name: "idx_listings_status_city", fields: ["status", "city"] },
    ],
  },
);

export default Listing;
