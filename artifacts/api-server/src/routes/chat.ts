import { Router, type IRouter } from "express";
import { asc, eq, desc } from "drizzle-orm";
import { db, chatMessagesTable, questionsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

const ROOMS = ["friends", "anonymous"] as const;
type Room = (typeof ROOMS)[number];

function isRoom(value: unknown): value is Room {
  return typeof value === "string" && (ROOMS as readonly string[]).includes(value);
}

router.get("/chat/:room", requireAuth, async (req, res) => {
  if (!isRoom(req.params.room)) {
    return res.status(400).json({ error: "Unknown chat room." });
  }
  const rows = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.room, req.params.room))
    .orderBy(asc(chatMessagesTable.createdAt))
    .limit(200);
  return res.json({ messages: rows });
});

router.post("/chat/:room", requireAuth, async (req: AuthedRequest, res) => {
  if (!isRoom(req.params.room)) {
    return res.status(400).json({ error: "Unknown chat room." });
  }
  const { content, displayName } = req.body ?? {};
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Message content is required." });
  }
  if (!displayName || typeof displayName !== "string") {
    return res.status(400).json({ error: "Display name is required." });
  }
  const [row] = await db
    .insert(chatMessagesTable)
    .values({
      room: req.params.room,
      userId: req.userId!,
      displayName,
      content: content.trim(),
    })
    .returning();
  return res.status(201).json({ message: row });
});

router.get("/questions", requireAuth, async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.userId, req.userId!))
    .orderBy(desc(questionsTable.createdAt));
  return res.json({ questions: rows });
});

router.get("/questions/all", requireAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(questionsTable)
    .orderBy(desc(questionsTable.createdAt));
  return res.json({ questions: rows });
});

router.post("/questions", requireAuth, async (req: AuthedRequest, res) => {
  const { content } = req.body ?? {};
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Question content is required." });
  }
  const ticketCode = `YC-${Math.floor(1000 + Math.random() * 9000)}`;
  const [row] = await db
    .insert(questionsTable)
    .values({ userId: req.userId!, ticketCode, content: content.trim() })
    .returning();
  return res.status(201).json({ question: row });
});

router.patch("/questions/:id/answer", requireAuth, async (req, res) => {
  const { answer } = req.body ?? {};
  if (!answer) return res.status(400).json({ error: "Answer is required." });
  const [row] = await db
    .update(questionsTable)
    .set({ answer, answeredAt: new Date() })
    .where(eq(questionsTable.id, Number(req.params.id)))
    .returning();
  return res.json({ question: row });
});

export default router;
