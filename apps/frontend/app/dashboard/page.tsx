"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, Loader2, Users } from "lucide-react";

import { getApplications, listChallenges, selectApplication, type Application, type Challenge } from "../../lib/api";

export default function DashboardPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const loaded = await listChallenges();
        setChallenges(loaded);
        if (loaded[0]) {
          setSelectedChallenge(loaded[0]);
          setApplications(await getApplications(loaded[0].id));
        }
      } catch {
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function chooseTeam(applicationId: number) {
    setSelecting(applicationId);
    try {
      const selected = await selectApplication(applicationId);
      setApplications((current) => current.map((application) => application.id === selected.id ? selected : { ...application, status: "rejected" }));
    } catch {
      setError("Could not select this team.");
    } finally {
      setSelecting(null);
    }
  }

  async function switchChallenge(challengeId: string) {
    const nextChallenge = challenges.find((challenge) => challenge.id === Number(challengeId));
    if (!nextChallenge) return;
    setSelectedChallenge(nextChallenge);
    setApplications(await getApplications(nextChallenge.id));
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]"><Loader2 className="animate-spin" /></main>;

  return <main className="min-h-screen bg-[#f7f8fc] text-gray-950"><header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"><Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"><BrainCircuit size={21} /></div><div><p className="font-bold">AI Sana Challenge Hub</p><p className="text-xs text-gray-400">Business dashboard</p></div></Link><div className="flex gap-3"><Link href="/challenges" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold">Marketplace</Link><Link href="/create" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">New challenge</Link></div></div></header><div className="mx-auto max-w-7xl px-6 py-12"><div className="mb-10"><h1 className="text-4xl font-bold tracking-tight md:text-5xl">Your challenges</h1><p className="mt-4 text-lg text-gray-600">Review published challenges and choose a student team.</p></div>{error && <p className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="grid gap-5 md:grid-cols-3"><StatCard title="Active challenges" value={String(challenges.length)} /><StatCard title="Applications" value={String(applications.length)} /><StatCard title="Average readiness" value={challenges.length ? String(Math.round(challenges.reduce((sum, item) => sum + item.readiness_score, 0) / challenges.length)) : "0"} suffix="/100" /></div>{challenges.length > 0 && <select value={selectedChallenge?.id ?? ""} onChange={(event) => switchChallenge(event.target.value)} className="mt-8 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 font-semibold outline-none focus:border-violet-500">{challenges.map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.title || "Untitled challenge"}</option>)}</select>}{selectedChallenge ? <section className="mt-4 rounded-[30px] border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-100 p-7"><div className="flex flex-wrap items-center justify-between gap-5"><div><span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">Published</span><h2 className="mt-4 text-2xl font-bold">{selectedChallenge.title}</h2><Link href={`/challenges/${selectedChallenge.id}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">Open challenge <ArrowRight size={15} /></Link></div><div className="rounded-2xl bg-green-50 px-5 py-4"><p className="text-xs font-bold uppercase tracking-wider text-green-600">Readiness</p><p className="mt-1 text-2xl font-bold text-green-700">{selectedChallenge.readiness_score}/100</p></div></div></div><div className="p-7"><h3 className="text-xl font-bold">Team applications</h3><p className="mt-1 text-sm text-gray-500">Compare teams and choose who you want to work with.</p><div className="mt-6 space-y-5">{applications.length === 0 && <p className="rounded-2xl bg-gray-50 p-6 text-gray-500">No applications yet.</p>}{applications.map((application) => <ApplicationCard key={application.id} application={application} selecting={selecting === application.id} onSelect={() => chooseTeam(application.id)} />)}</div></div></section> : <p className="mt-8 rounded-2xl bg-white p-8 text-gray-500">Publish a challenge to start receiving applications.</p>}</div></main>;
}

function ApplicationCard({ application, selecting, onSelect }: { application: Application; selecting: boolean; onSelect: () => void }) { const selected = application.status === "selected"; return <div className={`rounded-[24px] border p-6 ${selected ? "border-green-300 bg-green-50" : "border-gray-200"}`}><div className="flex flex-col justify-between gap-5 lg:flex-row"><div><div className="flex flex-wrap items-center gap-3"><h4 className="text-xl font-bold">{application.team_name}</h4>{selected && <span className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"><CheckCircle2 size={13} /> Selected</span>}</div><p className="mt-3 flex items-center gap-2 text-sm text-gray-500"><Users size={16} /> {application.contact}</p><p className="mt-4 max-w-2xl leading-7 text-gray-600">{application.team_description}</p><p className="mt-3 text-sm text-gray-500">{application.message}</p></div><div className="w-full lg:w-[220px]"><button onClick={onSelect} disabled={selecting || selected} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold ${selected ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-800"}`}>{selecting ? <Loader2 className="animate-spin" size={17} /> : selected ? <><CheckCircle2 size={17} /> Team selected</> : <>Select team <ArrowRight size={17} /></>}</button></div></div></div>; }
function StatCard({ title, value, suffix }: { title: string; value: string; suffix?: string }) { return <div className="rounded-[24px] border border-gray-200 bg-white p-6"><p className="text-sm font-medium text-gray-500">{title}</p><p className="mt-1 text-3xl font-bold">{value}<span className="text-lg font-semibold text-gray-400">{suffix}</span></p></div>; }
