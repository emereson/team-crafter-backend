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
      type: DataTypes.ENUM('pendiente', 'activa', 'expirada', 'cancelada'), // ✅ corregido
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
  },
  {
    tableName: 'suscripciones',
    timestamps: true,
  }
);

Suscripcion.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Plan.hasMany(Suscripcion, { foreignKey: 'plan_id', as: 'suscripciones' });

Suscripcion.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
User.hasMany(Suscripcion, { foreignKey: 'user_id', as: 'suscripciones' });

export { Suscripcion };
