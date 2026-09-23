"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, Loader2, Sparkles } from "lucide-react";

import {
  createChallenge,
  generateChallenge,
  publishChallenge,
  saveAnswers,
  type Challenge,
} from "../../lib/api";

export default function CreateChallenge() {
  const [description, setDescription] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeProblem() {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createChallenge(description.trim());
      setChallenge(created);
      setAnswers(Object.fromEntries(created.questions.map((question) => [question.id, question.answer ?? ""])));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to analyze the problem");
    } finally {
      setLoading(false);
    }
  }

  async function generateStructuredChallenge() {
    if (!challenge) return;
    setLoading(true);
    setError(null);
    try {
      const answerPayload = challenge.questions
        .map((question) => ({ question_id: question.id, answer: answers[question.id]?.trim() ?? "" }))
        .filter((answer) => answer.answer);
      const saved = await saveAnswers(challenge.id, answerPayload);
      setChallenge(await generateChallenge(saved.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate the challenge");
    } finally {
      setLoading(false);
    }
  }

  async function publishGeneratedChallenge() {
    if (!challenge) return;
    setLoading(true);
    setError(null);
    try {
      setChallenge(await publishChallenge(challenge.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to publish the challenge");
    } finally {
      setLoading(false);
    }
  }

  const generated = challenge?.status === "ready" || challenge?.status === "published";

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"><BrainCircuit size={21} /></div>
            <span className="font-bold">AI Sana Challenge Hub</span>
          </Link>
          <span className="text-sm text-gray-500">Create challenge</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"><ArrowLeft size={16} /> Back</Link>
        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
        {!challenge ? <ProblemForm description={description} setDescription={setDescription} onAnalyze={analyzeProblem} loading={loading} /> : !generated ? <AnalysisResult challenge={challenge} answers={answers} setAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))} onGenerate={generateStructuredChallenge} loading={loading} /> : <GeneratedChallenge challenge={challenge} onPublish={publishGeneratedChallenge} loading={loading} />}
      </div>
    </main>
  );
}

function ProblemForm({ description, setDescription, onAnalyze, loading }: { description: string; setDescription: (value: string) => void; onAnalyze: () => void; loading: boolean }) {
  return <><div className="mb-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700"><Sparkles size={16} /> AI Challenge Builder</div><h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">What problem does your organization want to solve?</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">Describe the problem in your own words. AI will identify missing details and prepare the right questions.</p></div><div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm"><label className="font-semibold">Describe your problem</label><p className="mt-1 text-sm text-gray-500">A short description is enough to start.</p><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Example: Our customer support team spends several hours every day manually categorizing incoming requests..." className="mt-5 min-h-[220px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-5 text-base leading-7 outline-none transition focus:border-violet-500 focus:bg-white" /><div className="mt-3 flex justify-between text-sm text-gray-400"><span>Be as specific as you can.</span><span>{description.length} characters</span></div><button onClick={onAnalyze} disabled={!description.trim() || loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300">{loading ? <><Loader2 className="animate-spin" size={19} /> Analyzing problem...</> : <>Analyze with AI <ArrowRight size={19} /></>}</button></div></>;
}

function AnalysisResult({ challenge, answers, setAnswer, onGenerate, loading }: { challenge: Challenge; answers: Record<number, string>; setAnswer: (id: number, value: string) => void; onGenerate: () => void; loading: boolean }) {
  return <div><div className="mb-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700"><Sparkles size={16} /> AI analysis complete</div><h1 className="text-4xl font-bold tracking-tight">Good start. We need a little more detail.</h1><p className="mt-4 text-lg text-gray-600">Answer these questions so AI can turn your idea into a complete challenge.</p></div><Score score={challenge.readiness_score} label="Needs clarification" color="orange" /><div className="space-y-5">{challenge.questions.map((question, index) => <Question key={question.id} number={index + 1} question={question.question} answer={answers[question.id] ?? question.answer ?? ""} onChange={(value) => setAnswer(question.id, value)} />)}</div><button onClick={onGenerate} disabled={loading} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300">{loading ? <><Loader2 className="animate-spin" size={19} /> Generating challenge...</> : <>Generate challenge <ArrowRight size={19} /></>}</button></div>;
}

function Question({ number, question, answer, onChange }: { number: number; question: string; answer: string; onChange: (value: string) => void }) {
  return <div className="rounded-[24px] border border-gray-200 bg-white p-6"><div className="flex gap-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">{number}</div><div className="w-full"><label className="font-semibold">{question}</label><textarea value={answer} onChange={(event) => onChange(event.target.value)} placeholder="Add a clear, specific answer..." className="mt-4 min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-violet-500 focus:bg-white" /></div></div></div>;
}

function GeneratedChallenge({ challenge, onPublish, loading }: { challenge: Challenge; onPublish: () => void; loading: boolean }) {
  const isPublished = challenge.status === "published";
  return <div><div className="mb-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700"><Sparkles size={16} /> {isPublished ? "Challenge published" : "Challenge ready"}</div><h1 className="text-4xl font-bold tracking-tight">{isPublished ? "Your challenge is live." : "Your challenge is ready to publish."}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">AI transformed your initial problem into a structured challenge students can understand and solve.</p></div><Score score={challenge.readiness_score} label={isPublished ? "Published" : "Ready to publish"} color="green" /><div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm"><div className="flex flex-col justify-between gap-6 border-b border-gray-100 pb-7 md:flex-row"><div><div className="mb-4 flex flex-wrap gap-2">{challenge.recommended_skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div><h2 className="text-3xl font-bold tracking-tight">{challenge.title}</h2><p className="mt-3 text-gray-500">AI Sana Challenge</p></div><div className="h-fit rounded-2xl bg-violet-50 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Readiness</p><p className="mt-1 text-2xl font-bold text-violet-800">{challenge.readiness_score}/100</p></div></div><Section title="Problem" text={challenge.problem} /><Section title="Goal" text={challenge.goal} /><Section title="Target users" text={challenge.target_users} /><Section title="Expected result" text={challenge.expected_result} /><div className="mt-8 grid gap-5 md:grid-cols-2"><InfoBox title="Success metrics" items={challenge.success_metrics} /><InfoBox title="Constraints" items={challenge.constraints} /></div><div className="mt-8"><p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Recommended skills</p><div className="mt-4 flex flex-wrap gap-2">{challenge.recommended_skills.map((skill) => <Skill key={skill}>{skill}</Skill>)}</div></div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button className="flex-1 rounded-2xl border border-gray-200 px-6 py-4 font-semibold transition hover:bg-gray-50">Edit challenge</button><button onClick={onPublish} disabled={loading || isPublished} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300">{loading ? <><Loader2 className="animate-spin" size={19} /> Publishing...</> : isPublished ? "Published" : <>Publish challenge <ArrowRight size={19} /></>}</button></div></div></div>;
}

function Score({ score, label, color }: { score: number; label: string; color: "orange" | "green" }) {
  const badgeClass = color === "green" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700";
  const barClass = color === "green" ? "bg-green-500" : "bg-orange-500";
  return <div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Challenge readiness</p><p className="mt-1 text-3xl font-bold">{score}/100</p></div><span className={`rounded-full px-4 py-2 text-sm font-semibold ${badgeClass}`}>{label}</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${barClass}`} style={{ width: `${score}%` }} /></div></div>;
}

function Section({ title, text }: { title: string; text: string | null }) { return <div className="border-b border-gray-100 py-7 last:border-0"><p className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</p><p className="mt-3 max-w-3xl leading-7 text-gray-700">{text}</p></div>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">{children}</span>; }
function Skill({ children }: { children: React.ReactNode }) { return <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">{children}</span>; }
function InfoBox({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl bg-gray-50 p-5"><p className="font-semibold">{title}</p><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />{item}</li>)}</ul></div>; }
type Usage = { prompt_tokens: number; completion_tokens: number; total_tokens: number };
type Analysis = { score: number; missing_fields: string[]; questions: string[]; provider?: string; model?: string; usage?: Usage; provider_error?: string; challenge?: Challenge };
type Challenge = { title: string; problem: string; goal: string; target_users: string; expected_result: string; success_metrics: string[]; constraints: string[]; recommended_skills: string[]; tags: string[]; quality_review: string[] };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CreateChallenge() {
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeProblem() {
    if (description.trim().length < 10) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description }) });
      if (!response.ok) throw new Error("The AI service returned an error.");
      setAnalysis(await response.json());
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to connect to the AI service."); } finally { setLoading(false); }
  }

  async function generateChallenge() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description, answers }) });
      if (!response.ok) throw new Error("The challenge could not be generated.");
      const result = await response.json(); setAnalysis(result); setChallenge(result.challenge);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to connect to the AI service."); } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f7f8fc]">
    <header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6"><Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"><BrainCircuit size={21} /></div><span className="font-bold">AI Sana Challenge Hub</span></Link><span className="text-sm text-gray-500">Create challenge</span></div></header>
    <div className="mx-auto max-w-4xl px-6 py-16"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"><ArrowLeft size={16} /> Back</Link>
      {!analysis ? <InputStep description={description} setDescription={setDescription} onAnalyze={analyzeProblem} loading={loading} /> : !challenge ? <AnalysisStep analysis={analysis} answers={answers} setAnswers={setAnswers} onGenerate={generateChallenge} loading={loading} /> : <ChallengeStep challenge={challenge} score={analysis.score} provider={analysis.provider} model={analysis.model} usage={analysis.usage} />}
      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {analysis?.provider_error && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">AI provider не ответил, поэтому показан резервный результат. Проверьте OPENAI_API_KEY и OPENAI_MODEL в ai-logic/.env.</div>}
    </div>
  </main>;
}

function InputStep({ description, setDescription, onAnalyze, loading }: { description: string; setDescription: (value: string) => void; onAnalyze: () => void; loading: boolean }) {
  return <><div className="mb-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700"><Sparkles size={16} /> AI Challenge Builder</div><h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">What problem does your organization want to solve?</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">Describe the business problem. AI will identify missing information and help turn it into a challenge students can solve.</p></div><div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm"><label className="font-semibold">Describe your problem</label><p className="mt-1 text-sm text-gray-500">A short description is enough to start.</p><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Example: Our customer support team spends several hours every day manually categorizing incoming requests..." className="mt-5 min-h-[220px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-5 text-base leading-7 outline-none transition focus:border-violet-500 focus:bg-white" /><div className="mt-3 flex justify-between text-sm text-gray-400"><span>Be as specific as you can.</span><span>{description.length} characters</span></div><button onClick={onAnalyze} disabled={description.trim().length < 10 || loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300">{loading ? <><Loader2 className="animate-spin" size={19} /> Analyzing problem...</> : <>Analyze with AI <ArrowRight size={19} /></>}</button></div></>;
}

function AnalysisStep({ analysis, answers, setAnswers, onGenerate, loading }: { analysis: Analysis; answers: Record<string, string>; setAnswers: (value: Record<string, string>) => void; onGenerate: () => void; loading: boolean }) {
  return <div><div className="mb-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700"><Sparkles size={16} /> AI analysis complete</div><h1 className="text-4xl font-bold tracking-tight">Good start. We need a little more detail.</h1><p className="mt-4 text-lg text-gray-600">Answer these questions so AI can turn your idea into a complete challenge.</p></div><div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Challenge readiness</p><p className="mt-1 text-3xl font-bold">{analysis.score}/100</p></div><span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">{analysis.score >= 70 ? "Good start" : "Needs clarification"}</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${analysis.score}%` }} /></div><p className="mt-3 text-xs text-gray-500">Provider: {analysis.provider || "AI"}</p></div><div className="space-y-5">{analysis.questions.map((question, index) => <div key={question} className="rounded-[24px] border border-gray-200 bg-white p-6"><div className="flex gap-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">{index + 1}</div><div className="w-full"><label className="font-semibold">{question}</label><textarea value={answers[`question_${index + 1}`] || ""} onChange={(event) => setAnswers({ ...answers, [`question_${index + 1}`]: event.target.value })} placeholder="Add a specific answer..." className="mt-4 min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-violet-500 focus:bg-white" /></div></div></div>)}</div><button onClick={onGenerate} disabled={loading} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300">{loading ? <><Loader2 className="animate-spin" size={19} /> Generating challenge...</> : <>Generate challenge <ArrowRight size={19} /></>}</button></div>;
}

function ChallengeStep({ challenge, score, provider, model, usage }: { challenge: Challenge; score: number; provider?: string; model?: string; usage?: Usage }) {
  return <div><div className="mb-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700"><Sparkles size={16} /> Challenge ready</div><h1 className="text-4xl font-bold tracking-tight">Your challenge is ready to publish.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">AI transformed the initial problem into a structured challenge students can understand and solve.</p></div><div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">Challenge readiness</p><p className="mt-2 text-4xl font-bold">{score}/100</p></div><span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">Ready to publish</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-green-500" style={{ width: `${score}%` }} /></div><p className="mt-3 text-xs text-gray-500">Generated with {provider || "AI"}{model ? ` · ${model}` : ""}{usage ? ` · ${usage.total_tokens} tokens` : ""}</p></div><div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm"><div className="flex flex-wrap gap-2">{challenge.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div><h2 className="mt-5 text-3xl font-bold tracking-tight">{challenge.title}</h2><Section title="Problem" text={challenge.problem} /><Section title="Goal" text={challenge.goal} /><Section title="Target users" text={challenge.target_users} /><Section title="Expected result" text={challenge.expected_result} /><InfoBox title="Success metrics" items={challenge.success_metrics} /><InfoBox title="Constraints" items={challenge.constraints} /><p className="mt-8 text-sm font-semibold uppercase tracking-wider text-gray-400">Recommended skills</p><div className="mt-4 flex flex-wrap gap-2">{challenge.recommended_skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div><div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-6"><p className="font-bold text-violet-950">AI Quality Review</p><ul className="mt-4 space-y-2 text-sm text-violet-800">{challenge.quality_review.map((item) => <li key={item}>✓ {item}</li>)}</ul></div><button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white">Publish challenge <ArrowRight size={19} /></button></div></div>;
}

function Section({ title, text }: { title: string; text: string }) { return <div className="border-b border-gray-100 py-7"><p className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</p><p className="mt-3 max-w-3xl leading-7 text-gray-700">{text}</p></div>; }
function InfoBox({ title, items }: { title: string; items: string[] }) { return <div className="mt-6 rounded-2xl bg-gray-50 p-5"><p className="font-semibold">{title}</p><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />{item}</li>)}</ul></div>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">{children}</span>; }
