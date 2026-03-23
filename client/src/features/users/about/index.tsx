import { motion } from "framer-motion"
import {
  Globe,
  Headphones,
  Flame,
  Radio,
  MapPin,
  Mail,
  Phone,
  Youtube,
  Facebook,
  Twitter,
  Heart,
  ChevronRight,
} from "lucide-react"
import { Link } from "react-router-dom"

const LEADERSHIP = [
  {
    name: "Pastor Emmanuel",
    role: "Senior Pastor & Founder",
    initials: "PE",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    name: "Pastor Grace",
    role: "Associate Pastor",
    initials: "PG",
    gradient: "from-indigo-600 to-blue-600",
  },
  {
    name: "Prophet Samuel",
    role: "Lead Prophet",
    initials: "PS",
    gradient: "from-blue-700 to-indigo-700",
  },
  {
    name: "Prophetess Ruth",
    role: "Prophetess",
    initials: "PR",
    gradient: "from-cyan-700 to-blue-700",
  },
  {
    name: "Deacon John",
    role: "Head Deacon",
    initials: "DJ",
    gradient: "from-slate-700 to-blue-800",
  },
  {
    name: "Sister Mary",
    role: "Women's Ministry",
    initials: "SM",
    gradient: "from-blue-800 to-indigo-800",
  },
]

const STATS = [
  { label: "Years of Ministry", value: "15+", icon: Heart },
  { label: "Souls Reached", value: "500K+", icon: Globe },
  { label: "Media Resources", value: "13K+", icon: Headphones },
  { label: "FM Frequencies", value: "2", icon: Radio },
]

const SOCIALS = [
  {
    icon: Youtube,
    label: "YouTube",
    handle: "@repentanceholiness",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
  },
  {
    icon: Facebook,
    label: "Facebook",
    handle: "RepentanceAndHoliness",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    handle: "@JILRadioKe",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
]

export default function AboutPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Barlow:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <div className="space-y-5 pb-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border p-6"
          style={{
            background: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
              <img
                src="/images/logo.png"
                alt="JIL Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
                JIL
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                ✝ Est. 2010
              </p>
              <h1
                className="text-xl leading-tight font-black text-white"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Ministry of Repentance
                <br />
                <span className="text-cyan-400">& Holiness</span>
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Nakuru, Kenya · Worldwide
              </p>
            </div>
          </div>
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: "var(--app-text-muted)" }}
          >
            Drawing souls to Jesus Christ through uncompromising Gospel
            preaching, Spirit-filled worship, prophetic ministry, and media
            outreach across East Africa and beyond.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border p-4 text-center"
              style={{
                background: "var(--app-card)",
                borderColor: "var(--app-border)",
              }}
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/15">
                <Icon size={15} className="text-cyan-400" />
              </div>
              <p
                className="text-lg font-black"
                style={{ color: "var(--app-text)" }}
              >
                {value}
              </p>
              <p
                className="mt-0.5 text-[10px]"
                style={{ color: "var(--app-text-muted)" }}
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
              <Flame size={13} className="text-amber-400" />
            </div>
            <h2 className="text-sm font-black text-white">Our Mission</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            To preach the full Gospel of Jesus Christ with signs and wonders
            following — calling men & women to repentance, holiness, and a
            radical daily walk with the Holy Spirit. We proclaim that Jesus is
            the only way, truth, and life.
          </p>
          <div className="mt-4 grid gap-2">
            {[
              "Uncompromising Biblical preaching",
              "Prophetic intercession & prayer",
              "24/7 Gospel radio broadcasting",
              "Discipleship & spiritual formation",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                <p className="text-xs text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radio */}
        <Link to="/jesus-is-lord-radio">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 p-5"
            style={{
              background: "linear-gradient(145deg, #060614, #0a0a1e, #0d1240)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Radio size={15} className="text-cyan-400" />
                  <span className="text-xs font-black text-cyan-400">
                    Jesus Is Lord Radio
                  </span>
                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-px text-[9px] font-black text-red-400">
                    LIVE
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  Broadcasting 24/7 Worldwide
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  105.3, 105.9 FM — Nakuru, Kenya
                </p>
              </div>
              <ChevronRight size={20} className="text-slate-600" />
            </div>
          </motion.div>
        </Link>

        {/* Leadership */}
        <div>
          <div className="mb-3 flex items-center gap-1.5">
            <h2 className="text-sm font-black text-white">Leadership Team</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {LEADERSHIP.map((leader, i) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-white/5 bg-white/3 p-4 text-center"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${leader.gradient} text-sm font-black text-white shadow`}
                >
                  {leader.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{leader.name}</p>
                  <p className="text-[10px] text-slate-500">{leader.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-3 rounded-2xl border border-white/5 bg-white/3 p-5">
          <h2 className="mb-4 text-sm font-black text-white">
            Contact & Socials
          </h2>
          {[
            { icon: MapPin, label: "Nakuru, Kenya — East Africa" },
            { icon: Mail, label: "info@jil-radio.co.ke" },
            { icon: Phone, label: "+254 700 000 000" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-white/5">
                <Icon size={14} className="text-cyan-400" />
              </div>
              <p className="text-sm text-slate-300">{label}</p>
            </div>
          ))}
          <div className="mt-4 grid gap-2">
            {SOCIALS.map(({ icon: Icon, label, handle, color, bg }) => (
              <button
                key={label}
                className={`flex items-center gap-3 rounded-xl border p-3 ${bg} transition-opacity hover:opacity-80`}
              >
                <Icon size={16} className={color} />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-300">
                    {label}
                  </p>
                  <p className="text-[10px] text-slate-600">{handle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
