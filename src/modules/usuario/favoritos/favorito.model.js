import { DataTypes } from 'sequelize';
import { db } from '../../../db/mysql.js';

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
    },
  },
  {
    tableName: 'favoritos',
    timestamps: true,
  }
);

export { Favorito };
