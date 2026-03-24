import { Router } from "express"
import type { Request, Response } from "express"
import { getDb } from "../db/connection.js"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// GET /api/media
router.get("/", (req: Request, res: Response) => {
  const db = getDb()
  const { type } = req.query
  const rows = type
    ? db.prepare("SELECT * FROM media WHERE published = 1 AND type = ? ORDER BY created_at DESC").all(type)
    : db.prepare("SELECT * FROM media WHERE published = 1 ORDER BY created_at DESC").all()
  res.json({ data: rows })
})

// GET /api/media/:id
router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(req.params.id)
  if (!row) return res.status(404).json({ error: "Not found" })
  res.json({ data: row })
})

// POST /api/media (admin)
router.post("/", (req: Request, res: Response) => {
  const { title, type, url, thumbnail, description, duration, published } = req.body
  if (!title || !type || !url) return res.status(400).json({ error: "title, type, and url are required" })
  if (!["video", "audio", "image"].includes(type)) return res.status(400).json({ error: "type must be video, audio, or image" })
  const db = getDb()
  const id = uuidv4()
  db.prepare(`
    INSERT INTO media (id, title, type, url, thumbnail, description, duration, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, type, url, thumbnail ?? null, description ?? null, duration ?? null, published ?? 1)
  res.status(201).json({ data: { id } })
})

// PATCH /api/media/:id (admin)
router.patch("/:id", (req: Request, res: Response) => {
  const { title, type, url, thumbnail, description, duration, published } = req.body
  const db = getDb()
  const existing = db.prepare("SELECT id FROM media WHERE id = ?").get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Not found" })
  db.prepare(`
    UPDATE media
    SET title = COALESCE(?, title),
        type = COALESCE(?, type),
        url = COALESCE(?, url),
        thumbnail = COALESCE(?, thumbnail),
        description = COALESCE(?, description),
        duration = COALESCE(?, duration),
        published = COALESCE(?, published),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(title, type, url, thumbnail, description, duration, published, req.params.id)
  res.json({ success: true })
})

// DELETE /api/media/:id (admin)
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const info = db.prepare("DELETE FROM media WHERE id = ?").run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: "Not found" })
  res.json({ success: true })
})

export default router
