import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import devotionalsRouter from "./devotionals";
import readingPlansRouter from "./reading-plans";
import prayersRouter from "./prayers";
import eventsRouter from "./events";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(devotionalsRouter);
router.use(readingPlansRouter);
router.use(prayersRouter);
router.use(eventsRouter);
router.use(chatRouter);

export default router;
