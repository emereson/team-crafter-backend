import express from "express";
import * as comentarioClaseMiddleware from "./comentarioClase.middleware.js";
import * as comentarioClaseController from "./comentarioClase.controllers.js";

const router = express.Router();

router
  .use("/:claseId/comentarios", 
    comentarioClaseMiddleware.validExistComentarioClase)
  .route("/:claseId/comentarios")
  .get(comentarioClaseController.findComentariosByClase)
  .post(comentarioClaseController.createComentarioClase);

router
  .use("/:claseId/comentarios/respuesta", 
    comentarioClaseMiddleware.validExistComentarioClase)
  .route("/:claseId/comentarios/respuesta")
  .post(comentarioClaseController.createRespuestaComentario);

router
  .use("/:claseId/comentarios/:comentarioId/like", 
    comentarioClaseMiddleware.validExistComentarioClase)
  .route("/:claseId/comentarios/:comentarioId/like")
  .post(comentarioClaseController.likeComentario)

router
  .use("/:claseId/comentarios/:comentarioId/unlike", 
    comentarioClaseMiddleware.validExistComentarioClase)
  .route("/:claseId/comentarios/:comentarioId/unlike")
  .post(comentarioClaseController.unlikeComentario)

const comentarioClaseRouter = router;

export { comentarioClaseRouter };
