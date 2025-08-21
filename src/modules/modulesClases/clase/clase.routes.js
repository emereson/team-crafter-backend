import express from "express";
import * as claseMiddleware from "./clase.middleware.js";
import * as claseController from "./clase.controllers.js";

const router = express.Router();

router.get("/clases", claseController.findAll);
router.post("/clases", claseController.createClase);

router
  .use("/clases/:id", claseMiddleware.validExistClase)
  .route("/clases/:id")
  .patch(claseController.updateClase)
  .delete(claseController.deleteClase)
  .get(claseController.findOne);

const claseRouter = router;

export { claseRouter };
