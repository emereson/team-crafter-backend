import express from "express";
import * as recursoMiddleware from "./recurso.middleware.js";
import * as recursoController from "./recurso.controllers.js";

const router = express.Router();

router.get("/", recursoController.findAll);
router.post("/", recursoController.createRecurso);

router
  .use("/:recursoId", recursoMiddleware.validExistRecurso)
  .route("/:recursoId")
  .patch(recursoController.updateRecurso)
  .delete(recursoController.deleteRecurso)
  .get(recursoController.findOne);

const recursoRouter = router;

export { recursoRouter };