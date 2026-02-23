import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const Suscripcion = db.define('suscripciones', {
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
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'activa', 'expirada', 'cancelada'),
    defaultValue: 'pendiente',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  suscripcion_id_paypal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  suscripcion_mp_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  motivo_cancelacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_cancelacion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export { Suscripcion };
