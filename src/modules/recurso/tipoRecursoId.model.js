import { DataTypes } from 'sequelize';
import { db } from '../../config/mysql.js';

const TipoRecursoId = db.define('tipo_recurso_ids', {
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
  tipo_recurso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export { TipoRecursoId };
