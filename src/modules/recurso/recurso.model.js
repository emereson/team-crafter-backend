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
      allowNull: false,
    },
    nombre_recurso: {
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
    tipo_recurso: {
      type: DataTypes.ENUM('Exclusivos', 'Adicionales'),
      allowNull: false,
    },
    categoria_recurso: {
      type: DataTypes.ENUM(
        'Cake Toppers',
        'Cajitas Temáticas',
        'Cartonaje',
        'Tarjetas Invitación',
        'Proyectos Varios'
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
  }
);

export { Recurso };
