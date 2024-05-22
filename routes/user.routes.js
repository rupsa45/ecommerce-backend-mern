import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deletUserById,
  getUserById,
  updateUserId
} from "../controllers/users.controllers.js";


import {
  authentication,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";


const router = express.Router();

router
  .route("/")
  .post(createUser)
  .get(authentication, authorizeAdmin, getAllUsers);

router.post("/auth", loginUser);
router.post("/logout", logoutUser);

router
  .route("/profile")
  .get(authentication, getCurrentUserProfile)
  .put(authentication, updateCurrentUserProfile);

router
  .route("/:id")
  .delete(authentication,authorizeAdmin,deletUserById)
  .get(authentication,authorizeAdmin,getUserById)
  .put(authentication,authorizeAdmin,updateUserId)

export default router;
