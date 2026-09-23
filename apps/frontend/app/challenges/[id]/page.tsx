"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BrainCircuit, CheckCircle2, Loader2, Send, Sparkles, Users, X } from "lucide-react";

import { createApplication, getApplications, getChallenge, type Challenge } from "../../../lib/api";

export default function ChallengeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [loadedChallenge, applications] = await Promise.all([getChallenge(id), getApplications(id)]);
        setChallenge(loadedChallenge);
        setApplicationCount(applications.length);
      } catch {
        setError("Could not load this challenge.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]"><Loader2 className="animate-spin" /></main>;
  if (error || !challenge) return <main className="min-h-screen bg-[#f7f8fc] p-10 text-center text-red-700">{error || "Challenge not found"}</main>;
  const challengeId = challenge.id;

  async function submitApplication(payload: { team_name: string; team_description: string; contact: string; message: string }) {
    await createApplication(challengeId, payload);
    setApplicationCount((count) => count + 1);
    setSubmitted(true);
  }

  return <main className="min-h-screen bg-[#f7f8fc] text-gray-950"><header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"><Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"><BrainCircuit size={21} /></div><div><p className="font-bold">AI Sana Challenge Hub</p><p className="text-xs text-gray-400">Challenge details</p></div></Link><Link href="/challenges" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold">Marketplace</Link></div></header><div className="mx-auto max-w-7xl px-6 py-12"><Link href="/challenges" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500"><ArrowLeft size={16} /> Back to challenges</Link><div className="grid gap-8 lg:grid-cols-[1fr_340px]"><section><div className="rounded-[30px] border border-gray-200 bg-white p-8 shadow-sm"><div className="flex items-start justify-between gap-6"><div><div className="mb-4 flex flex-wrap gap-2">{challenge.recommended_skills.slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">{skill}</span>)}</div><h1 className="text-4xl font-bold tracking-tight">{challenge.title || "Untitled challenge"}</h1><div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-500"><span className="flex items-center gap-2"><Users size={17} /> {applicationCount} applications</span><span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">{challenge.status}</span></div></div><div className="rounded-2xl bg-green-50 px-6 py-5"><p className="text-xs font-bold uppercase tracking-wider text-green-600">Readiness</p><p className="mt-1 text-3xl font-bold text-green-700">{challenge.readiness_score}/100</p></div></div><div className="mt-8 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-green-500" style={{ width: `${challenge.readiness_score}%` }} /></div></div><div className="mt-6 rounded-[30px] border border-gray-200 bg-white p-8"><ContentSection title="Problem" text={challenge.problem} /><ContentSection title="Goal" text={challenge.goal} /><ContentSection title="Target users" text={challenge.target_users} /><ContentSection title="Expected result" text={challenge.expected_result} /></div><div className="mt-6 grid gap-6 md:grid-cols-2"><InfoCard title="Success metrics" items={challenge.success_metrics} /><InfoCard title="Constraints" items={challenge.constraints} /></div></section><aside><div className="sticky top-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-gray-500">Interested in this challenge?</p><h2 className="mt-2 text-2xl font-bold">Apply with your team.</h2><p className="mt-3 text-sm leading-6 text-gray-600">Send your team details directly to the business owner.</p><button onClick={() => { setApplyOpen(true); setSubmitted(false); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white">Apply as a team <Send size={18} /></button><div className="mt-6 border-t border-gray-100 pt-5 text-sm font-semibold text-green-600">Open for applications</div></div></aside></div></div>{applyOpen && <ApplyModal submitted={submitted} onClose={() => setApplyOpen(false)} onSubmit={submitApplication} />}</main>;
}

function ContentSection({ title, text }: { title: string; text: string | null }) { return <div className="border-b border-gray-100 py-7 first:pt-0 last:border-0 last:pb-0"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Sparkles size={19} /></div><h2 className="text-lg font-bold">{title}</h2></div><p className="mt-4 leading-7 text-gray-600">{text || "Not specified"}</p></div>; }
function InfoCard({ title, items }: { title: string; items: string[] }) { return <div className="rounded-[26px] border border-gray-200 bg-white p-6"><h3 className="font-bold">{title}</h3><ul className="mt-5 space-y-4">{items.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-600"><CheckCircle2 size={17} className="mt-1 shrink-0 text-green-600" />{item}</li>)}</ul></div>; }

function ApplyModal({ submitted, onClose, onSubmit }: { submitted: boolean; onClose: () => void; onSubmit: (payload: { team_name: string; team_description: string; contact: string; message: string }) => Promise<void> }) {
  const [form, setForm] = useState({ team_name: "", team_description: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  async function submit() { if (Object.values(form).some((value) => !value.trim())) { setError("Fill in all fields."); return; } setLoading(true); setError(""); try { await onSubmit(form); } catch { setError("Could not submit application."); } finally { setLoading(false); } }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="w-full max-w-xl rounded-[28px] bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-violet-600">Team application</p><h2 className="mt-1 text-2xl font-bold">Apply to this challenge</h2></div><button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"><X size={18} /></button></div>{!submitted ? <><div className="mt-7 space-y-4"><Field label="Team name" value={form.team_name} onChange={(value) => update("team_name", value)} placeholder="Quantum Team" /><Field label="Team description" value={form.team_description} onChange={(value) => update("team_description", value)} placeholder="Who is in your team and what can you build?" /><Field label="Contact" value={form.contact} onChange={(value) => update("contact", value)} placeholder="Email or Telegram" /><Field label="Message" value={form.message} onChange={(value) => update("message", value)} placeholder="Why is your team a good fit?" multiline /></div>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<button onClick={submit} disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white disabled:bg-gray-300">{loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Submit application</button></> : <div className="py-12 text-center"><CheckCircle2 className="mx-auto text-green-600" size={48} /><h3 className="mt-5 text-2xl font-bold">Application submitted</h3><p className="mx-auto mt-3 max-w-sm leading-7 text-gray-500">The business can now review your team.</p><button onClick={onClose} className="mt-7 rounded-xl bg-black px-6 py-3 font-semibold text-white">Done</button></div>}</div></div>;
}

function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) { return <div><label className="text-sm font-semibold">{label}</label>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-violet-500" /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-violet-500" />}</div>; }
