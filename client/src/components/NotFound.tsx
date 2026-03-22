import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-500 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <AlertTriangle size={48} />
      </motion.div>
      <h1 className="mb-4 text-4xl font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Cinzel', serif" }}>
        Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-slate-500 dark:text-slate-400">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700"
        >
          Return to Home
        </motion.button>
      </Link>
    </div>
  )
}
