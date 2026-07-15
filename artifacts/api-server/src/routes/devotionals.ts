import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, devotionalsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/devotionals", requireAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(devotionalsTable)
    .orderBy(desc(devotionalsTable.publishDate));
  return res.json({ devotionals: rows });
});

router.post("/devotionals", requireAuth, async (req, res) => {
  const { title, scriptureRef, scriptureText, body } = req.body ?? {};
  if (!title || !scriptureRef || !scriptureText || !body) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  const [row] = await db
    .insert(devotionalsTable)
    .values({ title, scriptureRef, scriptureText, body })
    .returning();
  return res.status(201).json({ devotional: row });
});

router.delete("/devotionals/:id", requireAuth, async (req, res) => {
  await db
    .delete(devotionalsTable)
    .where(eq(devotionalsTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
