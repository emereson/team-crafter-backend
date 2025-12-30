import { DataTypes } from 'sequelize';
import { db } from '../../config/mysql.js';

const Recurso = db.define(
  'recursos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    clase_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nombre_recurso: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombre_recurso_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img_recurso: {
      type: DataTypes.STRING,
      default:
        'https://team-crafter.com/wp-content/uploads/2024/11/Team-Crafter-Footer-Logo.svg',
      allowNull: false,
    },
    link_recurso: {
      type: DataTypes.STRING,
      default:
        'https://team-crafter.com/wp-content/uploads/2024/11/Team-Crafter-Footer-Logo.svg',
      allowNull: false,
    },
    fecha_caducidad: {
      type: DataTypes.DATEONLY,
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
  }
);

export { Recurso };
