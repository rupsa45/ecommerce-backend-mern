import express from "express";

import {
  authentication,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategory,
  readCategory
} from "../controllers/category.controllers.js";

const router = express.Router();

router.route("/").post(authentication, authorizeAdmin, createCategory);

router
  .route("/:categoryId")
  .put(authentication, authorizeAdmin, updateCategory);

router
  .route("/:categoryId")
  .delete(authentication, authorizeAdmin, deleteCategory);

router.route("/categories").get(listCategory);

router.route("/:id").get(readCategory)

export default router;
