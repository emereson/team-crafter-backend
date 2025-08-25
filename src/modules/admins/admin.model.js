import { DataTypes } from 'sequelize';
import { db } from '../../db/mysql.js';

const Admin = db.define(
  'admins',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // genera automáticamente un UUID
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    correo: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue('correo', value.toLowerCase()); // 👈 siempre minúscula
      },
    },
    password: {
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
    tableName: 'admins',
    timestamps: true,
  }
);

export { Admin };
