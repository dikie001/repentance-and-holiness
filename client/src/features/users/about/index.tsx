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
  ArrowUpRight,
} from "lucide-react"
import { Link } from "react-router-dom"

const LEADERSHIP = [
  { name: "Pastor Emmanuel", role: "Senior Pastor & Founder", initials: "PE" },
  { name: "Pastor Grace", role: "Associate Pastor", initials: "PG" },
  { name: "Prophet Samuel", role: "Lead Prophet", initials: "PS" },
  { name: "Prophetess Ruth", role: "Prophetess", initials: "PR" },
  { name: "Deacon John", role: "Head Deacon", initials: "DJ" },
  { name: "Sister Mary", role: "Women's Ministry", initials: "SM" },
] as const

const STATS = [
  { label: "Years of Ministry", value: "15+", icon: Heart },
  { label: "Souls Reached", value: "500K+", icon: Globe },
  { label: "Media Resources", value: "13K+", icon: Headphones },
  { label: "FM Frequencies", value: "2", icon: Radio },
] as const

const CONTACTS = [
  { icon: MapPin, label: "Nakuru, Kenya - East Africa" },
  { icon: Mail, label: "info@jil-radio.co.ke" },
  { icon: Phone, label: "+254 700 000 000" },
] as const

const SOCIALS = [
  { icon: Youtube, label: "YouTube", handle: "@repentanceholiness" },
  { icon: Facebook, label: "Facebook", handle: "RepentanceAndHoliness" },
  { icon: Twitter, label: "X", handle: "@JILRadioKe" },
] as const

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-6">
      <section
        className="rounded-[32px] border px-5 py-6 md:px-7 md:py-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, var(--app-card) 40%, var(--app-surface) 100%)",
          borderColor: "var(--app-border)",
        }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <p
              className="text-[11px] font-black tracking-[0.22em] uppercase"
              style={{ color: "var(--app-text-faint)" }}
            >
              About the Ministry
            </p>
            <h1
              className="mt-3 text-3xl font-black tracking-tight md:text-4xl"
              style={{ color: "var(--app-text)" }}
            >
              Ministry of Repentance and Holiness
            </h1>
            <p
              className="mt-3 text-sm leading-7 md:text-base"
              style={{ color: "var(--app-text-muted)" }}
            >
              Drawing souls to Jesus Christ through uncompromising Gospel
              preaching, Spirit-filled worship, prophetic ministry, and media
              outreach across East Africa and beyond.
            </p>
          </div>

          <Link
            to="/jesus-is-lord-radio"
            className="inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold text-cyan-400"
            style={{ borderColor: "var(--app-border)" }}
          >
            Listen live <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-[24px] border p-5"
            style={{
              background: "var(--app-card)",
              borderColor: "var(--app-border)",
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
              <Icon size={18} />
            </div>
            <p
              className="mt-4 text-2xl font-black tracking-tight"
              style={{ color: "var(--app-text)" }}
            >
              {value}
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--app-text-muted)" }}
            >
              {label}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div
          className="rounded-[28px] border p-6"
          style={{
            background: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Flame size={18} />
            </div>
            <div>
              <p
                className="text-[11px] font-black tracking-[0.22em] uppercase"
                style={{ color: "var(--app-text-faint)" }}
              >
                Our Mission
              </p>
              <h2
                className="mt-1 text-xl font-black tracking-tight"
                style={{ color: "var(--app-text)" }}
              >
                Calling people to repentance, holiness, and readiness for Jesus.
              </h2>
            </div>
          </div>
          <p
            className="mt-5 text-sm leading-7"
            style={{ color: "var(--app-text-muted)" }}
          >
            We preach the full Gospel of Jesus Christ with prayer, worship, and
            discipleship at the center. Every broadcast, message, and gathering
            is shaped around Biblical truth and a life yielded to the Holy
            Spirit.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "Uncompromising Biblical preaching",
              "Prophetic intercession and prayer",
              "24/7 Gospel radio broadcasting",
              "Discipleship and spiritual formation",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border px-4 py-3 text-sm font-medium"
                style={{
                  background: "var(--app-surface)",
                  borderColor: "var(--app-border)",
                  color: "var(--app-text)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[28px] border p-6"
          style={{
            background: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <p
            className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "var(--app-text-faint)" }}
          >
            Leadership
          </p>
          <h2
            className="mt-1 text-xl font-black tracking-tight"
            style={{ color: "var(--app-text)" }}
          >
            Ministry Team
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {LEADERSHIP.map((leader) => (
              <div
                key={leader.name}
                className="rounded-2xl border px-4 py-4"
                style={{
                  background: "var(--app-surface)",
                  borderColor: "var(--app-border)",
                }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
                  {leader.initials}
                </div>
                <p
                  className="mt-3 text-sm font-bold"
                  style={{ color: "var(--app-text)" }}
                >
                  {leader.name}
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {leader.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div
          className="rounded-[28px] border p-6"
          style={{
            background: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <p
            className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "var(--app-text-faint)" }}
          >
            Contact
          </p>
          <h2
            className="mt-1 text-xl font-black tracking-tight"
            style={{ color: "var(--app-text)" }}
          >
            Get in Touch
          </h2>
          <div className="mt-5 space-y-3">
            {CONTACTS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{
                  background: "var(--app-surface)",
                  borderColor: "var(--app-border)",
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-cyan-400">
                  <Icon size={18} />
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--app-text)" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[28px] border p-6"
          style={{
            background: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <p
            className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "var(--app-text-faint)" }}
          >
            Socials
          </p>
          <h2
            className="mt-1 text-xl font-black tracking-tight"
            style={{ color: "var(--app-text)" }}
          >
            Follow the Ministry
          </h2>
          <div className="mt-5 space-y-3">
            {SOCIALS.map(({ icon: Icon, label, handle }) => (
              <button
                key={label}
                className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors"
                style={{
                  background: "var(--app-surface)",
                  borderColor: "var(--app-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-cyan-400">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--app-text)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      {handle}
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
