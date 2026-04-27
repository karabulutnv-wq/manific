"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function KayitPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Bir hata oluştu"); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-sm relative fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}>M</div>
            <span className="font-black text-xl tracking-tight">MANIFIC</span>
          </Link>
          <h1 className="text-2xl font-bold">Hesap oluştur</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Ücretsiz kayıt ol, manga oku</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Kullanıcı Adı</label>
              <input type="text" placeholder="kullanici_adi" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} className="input-field w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Email</label>
              <input type="email" placeholder="ornek@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Şifre</label>
              <input type="password" placeholder="En az 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="input-field w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            {error && (
              <div className="text-sm px-3 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-xl text-sm justify-center mt-1">
              {loading ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "var(--muted)" }}>
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-semibold" style={{ color: "var(--accent3)" }}>Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
