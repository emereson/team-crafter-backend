import { DataTypes } from 'sequelize';
import { db } from '../../config/mysql.js';

const Notificaciones = db.define('notificaciones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  tipo_notificacion: {
    type: DataTypes.ENUM('noticias', 'promociones'),
    allowNull: false,
    defaultValue: 'noticias',
  },
  notificacion_global: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contenido: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url_notificacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export { Notificaciones };
