import express from "express";
import { param } from "express-validator";
import ShopController from "../controllers/ShopController";

//this snippet defines routes with Express for fetching shop information
const router = express.Router();

router.get(
  "/:shopId",
  param("shopId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("ShopId paramenter must be a valid string"),
  ShopController.getShop
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City paramenter must be a valid string"),
  ShopController.searchShop
);

export default router;
