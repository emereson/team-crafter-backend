import { DataTypes } from 'sequelize';
import { db } from '../../../db/mysql.js';
import { Plan } from '../../plan/plan.model.js';
import { User } from '../user/user.model.js';

const Suscripcion = db.define(
  'suscripciones',
  {
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

    // Campos adicionales para Flow
    flow_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flow_subscription_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flow_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Campos adicionales para cancelación
    motivo_cancelacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_cancelacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'suscripciones',
    timestamps: true, // Esto crea automáticamente created_at y updated_at
  }
);

export { Suscripcion };
