import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface CategoryAttributes {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  is_active: boolean
  created_at?: Date
  updated_at?: Date
}

type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'description' | 'image' | 'is_active' | 'created_at' | 'updated_at'
>

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  declare id: string
  declare name: string
  declare slug: string
  declare description: string | null
  declare image: string | null
  declare is_active: boolean
  declare readonly created_at: Date
  declare readonly updated_at: Date

  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      image: this.image,
    }
  }
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['slug'] }, { fields: ['is_active'] }],
  },
)

export default Category
