import express from "express";

import {
  authentication,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";
import checkId from "../middlewares/checkId.js";
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts
} from "../controllers/product.controllers.js";

const router = express.Router();
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});


router
  .route("/")
  .get(fetchProducts)
  .post(authentication, authorizeAdmin, upload.single('image'), addProduct);

router.route("/allproducts").get(fetchAllProducts)

router.route("/:id/reviews").post(authentication,authorizeAdmin,checkId,addProductReview)

router.get("/top",fetchTopProducts)
router.get("/new",fetchNewProducts)

router
  .route("/:id")
  .get(fetchProductById)
  .put(authentication, authorizeAdmin, upload.single('image'), updateProductDetails)
  .delete(authentication, authorizeAdmin, removeProduct);

export default router;
