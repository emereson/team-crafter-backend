import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const User = db.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // genera automáticamente un UUID
      primaryKey: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: null,
    },
    foto_perfil: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
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
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    codigo_pais: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zona_horaria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dni_id_ce: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      allowNull: false,
      defaultValue: 'active',
    },

    // 🔹 Campos nuevos
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // por defecto el usuario NO está verificado
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true, // token temporal enviado al correo
    },
    tarjeta_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

export { User };
