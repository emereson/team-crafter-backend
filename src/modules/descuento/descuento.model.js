import { DataTypes } from 'sequelize';
import { db } from '../../config/mysql.js';

const Descuento = db.define(
  'descuentos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    titulo_descuento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion_descuento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_descuento: {
      type: DataTypes.ENUM('porcentaje', 'monto'),
      allowNull: false,
    },
    valor_descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    medio_descuento: {
      type: DataTypes.ENUM('online', 'offline'),
      allowNull: false,
    },
    codigo_descuento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Descuento };
