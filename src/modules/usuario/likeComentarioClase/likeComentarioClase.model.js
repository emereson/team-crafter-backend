import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const LikeComentarioClases = db.define(
  'like_comentario_clases',
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
    comentario_clase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'like_comentario_clases',
    timestamps: true,
  }
);

export { LikeComentarioClases };
