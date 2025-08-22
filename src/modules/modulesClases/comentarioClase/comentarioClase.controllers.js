import { ComentarioClase } from "./comentarioClase.model.js";
import { User } from "../../user/user.model.js";
import { catchAsync } from "../../../utils/catchAsync.js";

export const findComentariosByClase = catchAsync(async (req, res, next) => {
  const { claseId } = req.params;

  const comentarios = await ComentarioClase.findAll({
    where: {
      clase_id: claseId,
      comentario_padre_id: null,
    },
    include: [
      {
        model: ComentarioClase,
        as: "respuestas",
        include: [
          {
            model: User,
            attributes: ["id", "nombre", "apellidos", "foto_perfil"],
          },
        ],
      },
      {
        model: User,
        attributes: ["id", "nombre", "apellidos", "foto_perfil"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({
    status: "Success",
    results: comentarios.length,
    clases,
  });
});

export const createComentarioClase = catchAsync(async (req, res, next) => {
  const {
    clase_id,
    user_id,
    comentario,
    comentario_padre_id,
  } = req.body;

  const clase = await ComentarioClase.create({
    clase_id,
    user_id,
    comentario,
    comentario_padre_id,
  });

  res.status(201).json({
    status: "Success",
    message: "the comentario has been created successfully!",
    token,
    clase,
  });
});

export const createRespuestaComentario = catchAsync(async (req, res, next) => {
  const { comentario, comentario_padre_id } = req.body;
  const { claseId } = req.params;
  const { user } = req;

  const nuevaRespuesta = await ComentarioClase.create({
    clase_id: claseId,
    user_id: user.id,
    comentario,
    comentario_padre_id,
  });

  res.status(201).json({
    status: "Success",
    message: "the respuesta has been created successfully!",
    respuesta: nuevaRespuesta,
  });
});

export const likeComentario = catchAsync(async (req, res, next) => {
  const { comentarioId } = req.params;
  
  const comentario = await ComentarioClase.findByPk(comentarioId);
  
  if (!comentario) {
    return res.status(404).json({
      status: "Error",
      message: "Comentario not found"
    });
  }

  await comentario.update({
    nro_likes: comentario.nro_likes + 1
  });

  return res.status(200).json({
    status: "Success",
    message: "Like added successfully",
    nro_likes: comentario.nro_likes + 1
  });
}); 

export const unlikeComentario = catchAsync(async (req, res, next) => {
  const { comentarioId } = req.params;
  
  const comentario = await ComentarioClase.findByPk(comentarioId);
  
  if (!comentario) {
    return res.status(404).json({
      status: "Error",
      message: "Comentario not found"
    });
  }

  const nroLikes = Math.max(0, comentario.nro_likes - 1);
  
  await comentario.update({
    nro_likes: nroLikes
  });

  return res.status(200).json({
    status: "Success", 
    message: "Like removed successfully",
    nro_likes: nroLikes
  });
});
