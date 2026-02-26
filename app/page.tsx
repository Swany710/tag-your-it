import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-white text-lg">📡</span>
          </div>
          <span className="text-white font-bold text-lg">Tap System</span>
        </div>
        <Link href="/admin" className="btn-primary text-sm py-2 px-4">Admin Dashboard →</Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
          <span>🏠</span> Built for contractors
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          Turn every door knock<br />
          <span className="text-orange-400">into a data point.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Tap-to-lead cards for your reps. Smart completion plaques for every roof.
          Full analytics on every interaction.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/admin" className="btn-primary text-base py-3 px-6">Get Started →</Link>
          <a href="#how" className="btn-secondary text-base py-3 px-6">See How It Works</a>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "< 1s", label: "Tap response time" },
            { value: "∞", label: "Rewrite capability" },
            { value: "20+ yrs", label: "Tag lifespan" },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <p className="text-3xl font-black text-orange-400 mb-1">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Three use cases. One system.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🤝",
              title: "Rep Cards",
              desc: "Tap your 3D-printed house card → homeowner sees your profile, saves contact, books inspection. Every tap tracked to the rep.",
              color: "orange",
            },
            {
              icon: "🎪",
              title: "Trade Shows",
              desc: "Tap to enter, tap to book, tap to capture. Each rep gets a unique ID. Your booth becomes a lead machine.",
              color: "blue",
            },
            {
              icon: "🏠",
              title: "Job Completions",
              desc: "Permanent NFC disc in every install. Homeowner taps years later to access warranty info, maintenance reminders, referral rewards.",
              color: "green",
            },
          ].map((item) => (
            <div key={item.title} className="card">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hardware */}
      <section className="bg-slate-900 border-y border-slate-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">The hardware we use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card border-orange-500/30">
              <h3 className="text-white font-bold mb-2">38mm NTAG216 Wet Inlay</h3>
              <p className="text-slate-400 text-sm">Embedded in 3D printed rep cards. 888 bytes, NXP chip, instant tap. Perfect under 0.8mm PLA.</p>
              <div className="mt-3 text-orange-400 text-sm font-medium">Rep cards · 3D house models</div>
            </div>
            <div className="card border-green-500/30">
              <h3 className="text-white font-bold mb-2">NTAG216 Industrial Epoxy Disc</h3>
              <p className="text-slate-400 text-sm">Waterproof, impact-resistant, made to last decades. Installed at job completion. Permanent digital footprint for every roof.</p>
              <div className="mt-3 text-green-400 text-sm font-medium">Job plaques · Permanent installs</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Ready to tap smarter?</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Build your first serialized rep tag in under 10 minutes. No tech experience required.</p>
        <Link href="/admin" className="btn-primary text-lg py-4 px-8 inline-block">
          Open Dashboard →
        </Link>
      </section>

      <footer className="border-t border-slate-800 text-center text-slate-600 text-sm py-8">
        Tap System · Built by Swany
      </footer>
    </div>
  );
}
