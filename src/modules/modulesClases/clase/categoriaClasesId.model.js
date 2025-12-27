import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const CategoriaClasesId = db.define('categorias_clase_ids', {
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
  categoria_clase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export { CategoriaClasesId };
