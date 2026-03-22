import { Heart, Facebook, Twitter, Youtube, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-12 border-t border-blue-900/10 bg-slate-50/50 dark:bg-slate-950 px-6 py-10 text-center">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 md:flex-row md:items-start text-left">
        <div className="flex flex-col items-center max-w-sm text-center md:items-start md:text-left">
          <h3 className="mb-2 text-lg font-black text-blue-900 dark:text-blue-100" style={{ fontFamily: "'Cinzel', serif" }}>
            Repentance & Holiness
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Drawing souls to Jesus Christ through worship, teaching, and prophetic ministry.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Connect</h4>
          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-blue-600 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-blue-600 transition-colors"><Youtube size={20} /></a>
            <a href="#" className="hover:text-blue-600 transition-colors"><Instagram size={20} /></a>
          </div>
        </div>
      </div>
      
      <div className="mx-auto mt-10 max-w-4xl border-t border-blue-900/10 pt-6">
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          © {new Date().getFullYear()} Ministry. Built with <Heart size={12} className="text-red-500" fill="currentColor" /> for His Glory.
        </p>
      </div>
    </footer>
  )
}
