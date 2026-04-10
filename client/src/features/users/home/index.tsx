import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Play,
  Pause,
  Loader2,
  BookOpen,
  Flame,
  Music2,
  Video,
  ArrowUpRight,
} from "lucide-react"
import { useRadio } from "@/context/RadioContext"

const FEATURED = [
  {
    id: 1,
    title: "The Power of Repentance",
    type: "Teaching",
    speaker: "Pastor Emmanuel",
    meta: "1:12:44",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Holy Spirit Come Down",
    type: "Song",
    speaker: "Choir Ministry",
    meta: "5:34",
    icon: Music2,
  },
  {
    id: 3,
    title: "Vision of the End Times",
    type: "Prophecy",
    speaker: "Prophet Samuel",
    meta: "38:21",
    icon: Flame,
  },
  {
    id: 4,
    title: "Revival Fire Crusade 2026",
    type: "Video",
    speaker: "Ministry Team",
    meta: "2:04:15",
    icon: Video,
  },
] as const

const RECENT = [
  {
    id: 1,
    title: "A Call to Consecration",
    type: "Prophecy",
    speaker: "Prophet Samuel",
    meta: "Mar 20",
  },
  {
    id: 2,
    title: "Prayer and Fasting",
    type: "Teaching",
    speaker: "Pastor Grace",
    meta: "55:10",
  },
  {
    id: 3,
    title: "Abide in Me - Worship",
    type: "Song",
    speaker: "Worship Team",
    meta: "7:02",
  },
] as const

const TYPE_STYLES: Record<string, string> = {
  Teaching: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  Song: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  Prophecy: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Video: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
}

function LiveRadioCard() {
  const { playing, loading, togglePlay, recording, recDuration } = useRadio()

  const recordingLabel = `${Math.floor(recDuration / 60)
    .toString()
    .padStart(2, "0")}:${(recDuration % 60).toString().padStart(2, "0")}`

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={togglePlay}
      className="group flex w-full items-center justify-between gap-4 rounded-[28px] border p-5 text-left transition-colors md:p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, var(--app-card) 45%, var(--app-surface) 100%)",
        borderColor: "var(--app-border)",
      }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg">
          <img
            src="/images/radio-logo.png"
            alt="Jesus Is Lord Radio"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">
              Live Radio
            </span>
            {playing && (
              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-red-400 uppercase">
                On Air
              </span>
            )}
            {recording && (
              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-rose-400 uppercase">
                Rec {recordingLabel}
              </span>
            )}
          </div>
          <h2
            className="truncate text-lg font-black tracking-tight md:text-xl"
            style={{ color: "var(--app-text)" }}
          >
            Jesus Is Lord Radio
          </h2>
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "var(--app-text-muted)" }}
          >
            {loading
              ? "Connecting to the live stream..."
              : playing
                ? "Now playing - 105.3 / 105.9 FM"
                : "Tap to start the live broadcast"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className="hidden text-xs font-semibold md:block"
          style={{ color: "var(--app-text-muted)" }}
        >
          Open player
        </span>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </div>
      </div>
    </motion.button>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-8 pb-6">
      <section
        className="rounded-[32px] border px-5 py-6 md:px-7 md:py-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, var(--app-card) 48%, var(--app-surface) 100%)",
          borderColor: "var(--app-border)",
        }}
      >
        <div className="max-w-3xl">
          <p
            className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "var(--app-text-faint)" }}
          >
            Repentance and Holiness
          </p>
          <h1
            className="mt-3 text-3xl font-black tracking-tight md:text-4xl"
            style={{ color: "var(--app-text)" }}
          >
            One place for the live radio, teachings, worship, and ministry
            updates.
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm leading-7 md:text-base"
            style={{ color: "var(--app-text-muted)" }}
          >
            Follow the broadcast, listen back to featured messages, and browse
            recent ministry content without the crowded dashboard feel.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-black tracking-[0.22em] uppercase"
              style={{ color: "var(--app-text-faint)" }}
            >
              Live Now
            </p>
            <h2
              className="mt-1 text-xl font-black tracking-tight"
              style={{ color: "var(--app-text)" }}
            >
              Radio
            </h2>
          </div>
          <Link
            to="/jesus-is-lord-radio"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400"
          >
            Full player <ArrowUpRight size={15} />
          </Link>
        </div>
        <LiveRadioCard />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-black tracking-[0.22em] uppercase"
              style={{ color: "var(--app-text-faint)" }}
            >
              Featured
            </p>
            <h2
              className="mt-1 text-xl font-black tracking-tight"
              style={{ color: "var(--app-text)" }}
            >
              Listen and Watch
            </h2>
          </div>
          <Link
            to="/media"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400"
          >
            Media library <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {FEATURED.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[24px] border p-4"
                style={{
                  background: "var(--app-card)",
                  borderColor: "var(--app-border)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                    <Icon size={18} />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.14em] uppercase ${TYPE_STYLES[item.type]}`}
                  >
                    {item.type}
                  </span>
                </div>
                <h3
                  className="mt-4 text-base font-bold leading-snug"
                  style={{ color: "var(--app-text)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {item.speaker}
                </p>
                <p
                  className="mt-5 text-xs font-semibold"
                  style={{ color: "var(--app-text-faint)" }}
                >
                  {item.meta}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-black tracking-[0.22em] uppercase"
              style={{ color: "var(--app-text-faint)" }}
            >
              Recently Added
            </p>
            <h2
              className="mt-1 text-xl font-black tracking-tight"
              style={{ color: "var(--app-text)" }}
            >
              New Content
            </h2>
          </div>
          <Link
            to="/teachings"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400"
          >
            Browse teachings <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="space-y-3">
          {RECENT.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.06 }}
              className="flex items-center justify-between gap-3 rounded-[22px] border px-4 py-4"
              style={{
                background: "var(--app-card)",
                borderColor: "var(--app-border)",
              }}
            >
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.14em] uppercase ${TYPE_STYLES[item.type]}`}
                  >
                    {item.type}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--app-text-faint)" }}
                  >
                    {item.meta}
                  </span>
                </div>
                <h3
                  className="truncate text-base font-bold"
                  style={{ color: "var(--app-text)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {item.speaker}
                </p>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-cyan-400">
                <Play size={16} className="ml-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
