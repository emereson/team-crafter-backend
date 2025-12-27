import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const Clase = db.define(
  'clases',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },

    video_clase: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    poster_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    duracion_video: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titulo_clase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titulo_clase_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion_clase: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion_clase_en: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nro_reproducciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    nro_likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    categoria_clase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tutoriales_tips_id: {
      type: DataTypes.INTEGER,
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
    createdAt: 'createdAt',
  }
);

export { Clase };
