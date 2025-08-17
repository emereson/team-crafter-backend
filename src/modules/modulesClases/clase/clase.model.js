import { DataTypes } from "sequelize";
import { db } from "../../../db/mysql.js";

const Clase = db.define("clases", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  imagen_clase: {
    type: DataTypes.TEXT,
    default:
      "https://team-crafter.com/wp-content/uploads/2024/11/Team-Crafter-Footer-Logo.svg",
    allowNull: false,
  },
  titulo_clase: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tiempo_duracion_video: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  nro_reproducciones: {
    type: DataTypes.INTEGER,
    unique: true,
  },

  status: {
    type: DataTypes.ENUM("active", "disabled"),
    allowNull: false,
    defaultValue: "active",
  },
});

export { Clase };
