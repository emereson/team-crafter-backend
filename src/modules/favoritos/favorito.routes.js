import express from "express";
import * as favoritoMiddleware from "./favorito.middleware.js";
import * as favoritoController from "./favorito.controllers.js";

const router = express.Router();

router.get("/", favoritoController.findAll);
router.post("/", favoritoController.createFavorito);

router
  .use("/:favoritoId", favoritoMiddleware.validExistFavorito)
  .route("/:favoritoId")
  .patch(favoritoController.updateFavorito)
  .delete(favoritoController.deleteFavorito)
  .get(favoritoController.findOne);

const favoritoRouter = router;

export { favoritoRouter };