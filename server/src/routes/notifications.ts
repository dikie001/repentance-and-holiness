import { Router } from "express"
import type { Request, Response } from "express"
import { getDb } from "../db/connection.js"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// GET /api/notifications
router.get("/", (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all()
  res.json({ data: rows })
})

// POST /api/notifications (admin)
router.post("/", (req: Request, res: Response) => {
  const { title, body, type } = req.body
  if (!title || !body) return res.status(400).json({ error: "title and body are required" })
  const db = getDb()
  const id = uuidv4()
  db.prepare("INSERT INTO notifications (id, title, body, type) VALUES (?, ?, ?, ?)").run(
    id, title, body, type ?? "info"
  )
  res.status(201).json({ data: { id } })
})

// PATCH /api/notifications/:id/read
router.patch("/:id/read", (req: Request, res: Response) => {
  const db = getDb()
  const info = db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: "Not found" })
  res.json({ success: true })
})

// DELETE /api/notifications/:id (admin)
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const info = db.prepare("DELETE FROM notifications WHERE id = ?").run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: "Not found" })
  res.json({ success: true })
})

export default router
