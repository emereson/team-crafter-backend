import { DataTypes } from "sequelize";
import { db } from "../../../db/mysql.js";

const ComentarioClase = db.define("comentarios_clases", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  clase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "clases",
      key: "id",
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  comentario_padre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "comentarios_clases",
      key: "id",
    },
  },
  nro_likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export { ComentarioClase };

ComentarioClase.hasMany(ComentarioClase, {
  foreignKey: "comentario_padre_id",
  as: "respuestas",
});

ComentarioClase.belongsTo(ComentarioClase, {
  foreignKey: "comentario_padre_id",
  as: "comentario_padre",
});
