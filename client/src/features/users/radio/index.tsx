import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, Volume2, Share2, Star, Download, Repeat, Shuffle, Bookmark, MoreVertical } from "lucide-react"

export default function RadioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  
  return (
    <div className="flex h-full min-h-[80vh] flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden rounded-3xl relative">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
           className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
           style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 60%)" }}
           animate={isPlaying ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { scale: 1, opacity: 0.2 }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 py-8">
        {/* Top Bar Equivalent */}
        <div className="mb-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <span className="text-[10px] font-bold">R&H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-300">JESUS IS LORD RA...</span>
              <span className="text-[10px] text-slate-400">JESUS IS LORD RADIO</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <motion.button whileTap={{ scale: 0.9 }}>
              <Bookmark size={20} className="text-slate-300 hover:text-white" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }}>
              <MoreVertical size={20} className="text-slate-300 hover:text-white" />
            </motion.button>
          </div>
        </div>

        {/* Center Album Art */}
        <motion.div
           className="relative mb-12 flex h-64 w-64 items-center justify-center rounded-full bg-white p-2 shadow-[0_0_50px_rgba(37,99,235,0.3)]"
           animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-full w-full rounded-full border-4 border-slate-100 overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900">
             <span className="text-4xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>RADIO</span>
          </div>
        </motion.div>

        {/* Title Area */}
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-black tracking-tight text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            JESUS IS LORD RADIO
          </h1>
          <p className="mb-3 text-sm font-medium text-blue-300">JESUS IS LORD RADIO</p>
          <div className="flex justify-center gap-1">
             {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-slate-600" fill="currentColor" />)}
          </div>
          <p className="mt-2 text-xs text-slate-500">1/1</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 w-full">
          <div className="flex w-full items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>0:00</span>
            <span>0:00</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div 
               className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
               animate={isPlaying ? { width: ["0%", "100%"] } : { width: "0%" }}
               transition={{ duration: 60 * 60, ease: "linear" }} /* 1 hour mock progress */
            />
          </div>
        </div>

        {/* Primary Controls */}
        <div className="mb-10 flex w-full items-center justify-between px-2">
          <motion.button whileTap={{ scale: 0.8 }} className="text-slate-400 hover:text-white transition-colors">
            <Shuffle size={22} />
          </motion.button>
          
          <motion.button whileTap={{ scale: 0.8 }} className="text-slate-200 hover:text-white transition-colors">
            <SkipBack size={28} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </motion.button>
          
          <motion.button whileTap={{ scale: 0.8 }} className="text-slate-200 hover:text-white transition-colors">
            <SkipForward size={28} />
          </motion.button>
          
          <motion.button whileTap={{ scale: 0.8 }} className="text-slate-400 hover:text-white transition-colors">
            <Repeat size={22} />
          </motion.button>
        </div>

        {/* Secondary Actions (Bottom Bar equivalent) */}
        <div className="mt-auto w-full border-t border-slate-800 pt-6">
          <div className="flex w-full items-center justify-around text-slate-400">
            <motion.button whileTap={{ scale: 0.8 }} className="hover:text-white transition-colors flex flex-col items-center gap-1">
              <div className="h-6 w-6 rounded-full border border-current flex items-center justify-center border-dashed">
                 <span className="text-[14px]">+</span>
              </div>
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="hover:text-white transition-colors">
              <Share2 size={22} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="hover:text-white transition-colors">
              <Download size={22} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="hover:text-white transition-colors">
              <Star size={22} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="hover:text-white transition-colors">
              <Volume2 size={22} />
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  )
}
