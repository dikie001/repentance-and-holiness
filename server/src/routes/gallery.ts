import { Router } from "express"
import type { Request, Response } from "express"
import { getDb } from "../db/connection.js"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// GET /api/gallery
router.get("/", (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all()
  res.json({ data: rows })
})

// POST /api/gallery (admin)
router.post("/", (req: Request, res: Response) => {
  const { url, title, caption } = req.body
  if (!url) return res.status(400).json({ error: "url is required" })
  const db = getDb()
  const id = uuidv4()
  db.prepare("INSERT INTO gallery (id, url, title, caption) VALUES (?, ?, ?, ?)").run(
    id, url, title ?? null, caption ?? null
  )
  res.status(201).json({ data: { id } })
})

// DELETE /api/gallery/:id (admin)
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const info = db.prepare("DELETE FROM gallery WHERE id = ?").run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: "Not found" })
  res.json({ success: true })
})

export default router
