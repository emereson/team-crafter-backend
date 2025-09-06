import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const LikeComentarioForo = db.define(
  'like_comentario_foros',
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
    comentario_foro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'like_comentario_foros',
    timestamps: true,
  }
);

export { LikeComentarioForo };
