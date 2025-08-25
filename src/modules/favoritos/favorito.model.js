import { DataTypes } from 'sequelize';
import { db } from '../../db/mysql.js';

const Favorito = db.define(
  'favoritos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    clase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clases',
        key: 'id',
      },
    },
    titulo_favorito: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Favorito };
