import { DataTypes } from "sequelize";
import { db } from "../../db/mysql.js";

const User = db.define("users", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  foto_perfil: {
    type: DataTypes.TEXT,
    default:
      "https://team-crafter.com/wp-content/uploads/2024/11/Team-Crafter-Footer-Logo.svg",
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "",
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "",
  },

  correo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "",
  },
  codigo_pais: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "",
  },

  zona_horaria: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "",
  },
  dni_id_ce: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "",
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("active", "disabled"),
    allowNull: false,
    defaultValue: "active",
  },
});

export { User };
