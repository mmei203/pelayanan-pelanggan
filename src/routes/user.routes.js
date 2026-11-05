import { Router } from "express";
import {
	getAllUsers,
	createUser,
	updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);

export default router;
