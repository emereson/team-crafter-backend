import { DataTypes } from 'sequelize';
import { db } from '../../config/mysql.js';

const CategoriaRecursoId = db.define('categorias_recurso_ids', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  recurso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categoria_recurso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export { CategoriaRecursoId };
