import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { initDb } from "./db/init.js"
import galleryRoutes from "./routes/gallery.js"
import mediaRoutes from "./routes/media.js"
import notificationsRoutes from "./routes/notifications.js"
import propheciesRoutes from "./routes/prophecies.js"
import teachingsRoutes from "./routes/teachings.js"
import radioRoutes from "./routes/radio.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
try {
  initDb()
  console.log("✓ Database initialized")
} catch (error) {
  console.error("✗ Database initialization failed:", error)
  process.exit(1)
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API Routes
app.use("/api/gallery", galleryRoutes)
app.use("/api/media", mediaRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use("/api/prophecies", propheciesRoutes)
app.use("/api/teachings", teachingsRoutes)
app.use("/api/radio", radioRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({ error: err.message || "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
