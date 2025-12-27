import { DataTypes } from 'sequelize';
import { db } from '../../../config/mysql.js';

const TipClasesId = db.define('tips_clases_ids', {
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
  tip_clase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export { TipClasesId };
