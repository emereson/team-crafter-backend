import { DataTypes } from "sequelize";
import { db } from "../../db/mysql.js";

const Recurso = db.define("recursos", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  imagen_recurso: {
    type: DataTypes.TEXT,
    default:
      "https://team-crafter.com/wp-content/uploads/2024/11/Team-Crafter-Footer-Logo.svg",
    allowNull: false,
  },
  titulo_recurso: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion_recurso: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link_recurso: {
    type: DataTypes.STRING,
    default:
      "https://team-crafter.com/wp-content/uploads/2024/11/Team-Crafter-Footer-Logo.svg",
    allowNull: false,
  },
  tiempo_caducidad: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  premium_recurso: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM("active", "disabled"),
    allowNull: false,
    defaultValue: "active",
  },
},
{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export { Recurso };
