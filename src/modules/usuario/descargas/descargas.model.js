import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const Descargas = db.define(
  'descargas',
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
    recurso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_descarga: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

export { Descargas };
