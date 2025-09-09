// routes/geminiRoutes.js
import express from "express";
import { summarizeChat } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/summarize", summarizeChat);

export default router;
