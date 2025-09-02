// models/Plan.js
import { DataTypes } from 'sequelize';
import { db } from '../../db/mysql.js';

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
  interval_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  flow_plan_id: {
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
