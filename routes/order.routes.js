import express from "express";
import {
  authentication,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countToatlOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderPaid,
  markedAsDelivered
} from "../controllers/order.controllers.js";

const router = express.Router();

router
  .route("/")
  .post(authentication, createOrder)
  .get(authentication, authorizeAdmin, getAllOrders);

router.route("/mine").get(authentication, getUserOrders);

router.route("/total-orders").get(countToatlOrders);

router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calculateTotalSalesByDate);
router.route("/:id").get(authentication,findOrderById);

router.route("/:id/pay").put(authentication,markOrderPaid);
router.route('/:id/deliver').put(authentication,authorizeAdmin,markedAsDelivered)
export default router;
