// models/Plan.js
import { DataTypes } from 'sequelize';
import { db } from '../../config/mysql.js';

const Plan = db.define('planes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  nombre_plan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  precio_plan: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  precio_plan_soles: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  interval_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mercado_pago_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paypal_plan_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    allowNull: false,
    defaultValue: 'active',
  },
});

export { Plan };
