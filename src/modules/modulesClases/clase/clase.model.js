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
    categoria_clase: {
      type: DataTypes.ENUM(
        'Cake Toppers',
        'Cajitas Temáticas',
        'Cartonaje',
        'Tarjetas Invitación',
        'Proyectos Varios'
      ),
      allowNull: false,
    },
    tutoriales_tips: {
      type: DataTypes.ENUM(
        'Tutoriales Silhouette Studio',
        'Tutoriales Cricut Design',
        'Tips de Diseño',
        'Tips de Corte',
        'Varios/otros'
      ),
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
