import { Router } from "express"
import type { Request, Response } from "express"
import { getDb } from "../db/connection.js"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// GET /api/prophecies
router.get("/", (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.prepare("SELECT * FROM prophecies WHERE published = 1 ORDER BY created_at DESC").all()
  res.json({ data: rows })
})

// GET /api/prophecies/:id
router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const row = db.prepare("SELECT * FROM prophecies WHERE id = ?").get(req.params.id)
  if (!row) return res.status(404).json({ error: "Not found" })
  res.json({ data: row })
})

// POST /api/prophecies (admin)
router.post("/", (req: Request, res: Response) => {
  const { title, content, author, published } = req.body
  if (!title || !content) return res.status(400).json({ error: "title and content are required" })
  const db = getDb()
  const id = uuidv4()
  db.prepare(`
    INSERT INTO prophecies (id, title, content, author, published)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title, content, author ?? "Prophecy", published ?? 1)
  res.status(201).json({ data: { id } })
})

// PATCH /api/prophecies/:id (admin)
router.patch("/:id", (req: Request, res: Response) => {
  const { title, content, author, published } = req.body
  const db = getDb()
  const existing = db.prepare("SELECT id FROM prophecies WHERE id = ?").get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Not found" })
  db.prepare(`
    UPDATE prophecies
    SET title = COALESCE(?, title),
        content = COALESCE(?, content),
        author = COALESCE(?, author),
        published = COALESCE(?, published),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(title, content, author, published, req.params.id)
  res.json({ success: true })
})

// DELETE /api/prophecies/:id (admin)
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const info = db.prepare("DELETE FROM prophecies WHERE id = ?").run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: "Not found" })
  res.json({ success: true })
})

export default router
