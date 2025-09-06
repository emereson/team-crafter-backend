import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const LikeClase = db.define(
  'like_clases',
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
    timestamps: true,
  }
);

export { LikeClase };
