import express from "express";
import * as descuentoMiddleware from "./descuento.middleware.js";
import * as descuentoController from "./descuento.controllers.js";

const router = express.Router();

router.get("/", descuentoController.findAll);
router.post("/", descuentoController.createDescuento);

router
  .use("/:descuentoId", descuentoMiddleware.validExistDescuento)
  .route("/:descuentoId")
  .patch(descuentoController.updateDescuento)
  .delete(descuentoController.deleteDescuento)
  .get(descuentoController.findOne);

const descuentoRouter = router;

export { descuentoRouter };