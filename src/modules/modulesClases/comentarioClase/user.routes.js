import express from "express";
import * as claseMiddleware from "./clase.middleware.js";
import * as claseController from "./clase.controllers.js";

const router = express.Router();

router.get("/", claseController.findAll);
router.post("/", claseController.create);

router
  .use("/:id", claseMiddleware.validExistClase)
  .route("/:id")
  .patch(claseController.update)
  .delete(claseController.deleteUser)
  .get(claseController.findOne);

const claseRouter = router;

export { claseRouter };
