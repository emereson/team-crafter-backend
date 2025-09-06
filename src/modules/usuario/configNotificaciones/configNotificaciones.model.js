import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const ConfigNotificaciones = db.define(
  'config_notificaciones',
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
    noticias: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    promociones: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

export { ConfigNotificaciones };
