import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const Foro = db.define(
  'foros',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    titulo_foro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contenido_foro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img_foro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoria_foro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },
    likes_foro: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Foro };
