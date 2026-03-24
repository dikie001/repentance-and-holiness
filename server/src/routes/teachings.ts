import { Router } from "express"
import type { Request, Response } from "express"
import { getDb } from "../db/connection.js"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// GET /api/teachings
router.get("/", (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.prepare("SELECT * FROM teachings WHERE published = 1 ORDER BY created_at DESC").all()
  res.json({ data: rows })
})

// GET /api/teachings/:id
router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const row = db.prepare("SELECT * FROM teachings WHERE id = ?").get(req.params.id)
  if (!row) return res.status(404).json({ error: "Not found" })
  res.json({ data: row })
})

// POST /api/teachings (admin)
router.post("/", (req: Request, res: Response) => {
  const { title, speaker, description, video_url, audio_url, thumbnail, duration, published } = req.body
  if (!title) return res.status(400).json({ error: "title is required" })
  const db = getDb()
  const id = uuidv4()
  db.prepare(`
    INSERT INTO teachings (id, title, speaker, description, video_url, audio_url, thumbnail, duration, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, speaker ?? "Pastor", description ?? null, video_url ?? null, audio_url ?? null, thumbnail ?? null, duration ?? null, published ?? 1)
  res.status(201).json({ data: { id } })
})

// PATCH /api/teachings/:id (admin)
router.patch("/:id", (req: Request, res: Response) => {
  const { title, speaker, description, video_url, audio_url, thumbnail, duration, published } = req.body
  const db = getDb()
  const existing = db.prepare("SELECT id FROM teachings WHERE id = ?").get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Not found" })
  db.prepare(`
    UPDATE teachings
    SET title = COALESCE(?, title),
        speaker = COALESCE(?, speaker),
        description = COALESCE(?, description),
        video_url = COALESCE(?, video_url),
        audio_url = COALESCE(?, audio_url),
        thumbnail = COALESCE(?, thumbnail),
        duration = COALESCE(?, duration),
        published = COALESCE(?, published),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(title, speaker, description, video_url, audio_url, thumbnail, duration, published, req.params.id)
  res.json({ success: true })
})

// DELETE /api/teachings/:id (admin)
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const info = db.prepare("DELETE FROM teachings WHERE id = ?").run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: "Not found" })
  res.json({ success: true })
})

export default router
