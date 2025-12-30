import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const CategoriaRecurso = db.define('categorias_recursos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },

  nombre_es: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  nombre_en: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export { CategoriaRecurso };
