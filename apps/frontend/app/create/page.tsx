"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function CreateChallenge() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [generated, setGenerated] = useState(false);

  function analyzeProblem() {
    if (!description.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1200);
  }

function generateChallenge() {
  setLoading(true);

  setTimeout(() => {
    setLoading(false);
    setGenerated(true);
  }, 1200);
}

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
<Link href="/" className="flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
    <BrainCircuit size={21} />
  </div>

  <span className="font-bold">AI Sana Challenge Hub</span>
</Link>

          <span className="text-sm text-gray-500">Create challenge</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
<Link
  href="/"
  className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"
>
  <ArrowLeft size={16} />
  Back
</Link>

        {!analyzed ? (
          <>
            <div className="mb-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                <Sparkles size={16} />
                AI Challenge Builder
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
                What problem does your organization want to solve?
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              </p>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm">
              <label className="font-semibold">Describe your problem</label>

              <p className="mt-1 text-sm text-gray-500">
                A short description is enough to start.
              </p>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: Our customer support team spends several hours every day manually categorizing incoming requests..."
                className="mt-5 min-h-[220px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-5 text-base leading-7 outline-none transition focus:border-violet-500 focus:bg-white"
              />

              <div className="mt-3 flex justify-between text-sm text-gray-400">
                <span>Be as specific as you can.</span>
                <span>{description.length} characters</span>
              </div>

              <button
                onClick={analyzeProblem}
                disabled={!description.trim() || loading}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={19} />
                    Analyzing problem...
                  </>
                ) : (
                  <>
                    Analyze with AI
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </div>
                    </>
        ) : !generated ? (
          <AnalysisResult
            onGenerate={generateChallenge}
            loading={loading}
          />
        ) : (
          <GeneratedChallenge />
        )}
      </div>
    </main>
  );
}

function AnalysisResult({
  onGenerate,
  loading,
}: {
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <div className="mb-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
          <Sparkles size={16} />
          AI analysis complete
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Good start. We need a little more detail.
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Answer these questions so AI can turn your idea into a complete
          challenge.
        </p>
      </div>

      <div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Challenge readiness
            </p>

            <p className="mt-1 text-3xl font-bold">43/100</p>
          </div>

          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            Needs clarification
          </span>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-[43%] rounded-full bg-orange-500" />
        </div>
      </div>

      <div className="space-y-5">
        <Question
          number={1}
          question="Who is most affected by this problem?"
          placeholder="Example: Our customer support department..."
        />

        <Question
          number={2}
          question="How is this problem currently handled?"
          placeholder="Describe the current process..."
        />

        <Question
          number={3}
          question="What measurable result would make this project successful?"
          placeholder="Example: Reduce manual processing time by 40%..."
        />

        <Question
          number={4}
          question="What constraints should student teams know about?"
          placeholder="Timeline, budget, technologies, data access..."
        />
      </div>

      <button
  onClick={onGenerate}
  disabled={loading}
  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300"
>
  {loading ? (
    <>
      <Loader2 className="animate-spin" size={19} />
      Generating challenge...
    </>
  ) : (
    <>
      Generate challenge
      <ArrowRight size={19} />
    </>
  )}
</button>
    </div>
  );
}

function Question({
  number,
  question,
  placeholder,
}: {
  number: number;
  question: string;
  placeholder: string;
}) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-white p-6">
      <div className="flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
          {number}
        </div>

        <div className="w-full">
          <label className="font-semibold">{question}</label>

          <textarea
            placeholder={placeholder}
            className="mt-4 min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-violet-500 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
function GeneratedChallenge() {
  return (
    <div>
      <div className="mb-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
          <Sparkles size={16} />
          Challenge ready
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Your challenge is ready to publish.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
          AI transformed your initial problem into a structured challenge
          students can understand and solve.
        </p>
      </div>

      {/* SCORE */}
      <div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Challenge readiness
            </p>

            <div className="mt-2 flex items-end gap-3">
              <p className="text-4xl font-bold">89/100</p>

              <span className="mb-1 text-sm font-semibold text-green-600">
                +46 improvement
              </span>
            </div>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            Ready to publish
          </span>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-[89%] rounded-full bg-green-500" />
        </div>
      </div>

      {/* CHALLENGE CARD */}
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 border-b border-gray-100 pb-7 md:flex-row">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Tag>AI</Tag>
              <Tag>Automation</Tag>
              <Tag>Customer Support</Tag>
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              AI-Powered Customer Support Automation
            </h2>

            <p className="mt-3 text-gray-500">
              Business Operations • AI Sana Challenge
            </p>
          </div>

          <div className="h-fit rounded-2xl bg-violet-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
              Readiness
            </p>

            <p className="mt-1 text-2xl font-bold text-violet-800">89/100</p>
          </div>
        </div>

        <Section
          title="Problem"
          text="The customer support team spends several hours every day manually reviewing, categorizing and routing incoming customer requests. This creates delays and increases employee workload."
        />

        <Section
          title="Goal"
          text="Build an AI-assisted solution that automatically categorizes incoming support requests and routes them to the appropriate department."
        />

        <Section
          title="Target users"
          text="Customer support employees and operational managers."
        />

        <Section
          title="Expected result"
          text="A functional prototype capable of processing incoming requests and assigning each request to an appropriate category."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoBox
            title="Success metrics"
            items={[
              "Reduce manual processing time by 40%",
              "Classification accuracy above 85%",
              "Average processing time below 5 seconds",
            ]}
          />

          <InfoBox
            title="Constraints"
            items={[
              "Use anonymized data only",
              "Prototype must be web-based",
              "Solution should expose an API",
            ]}
          />
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Recommended skills
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Skill>Python</Skill>
            <Skill>AI / ML</Skill>
            <Skill>NLP</Skill>
            <Skill>FastAPI</Skill>
            <Skill>React</Skill>
          </div>
        </div>

        {/* AI QUALITY REVIEW */}
        <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Sparkles size={19} />
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-violet-950">
                    AI Quality Review
                  </p>

                  <p className="mt-1 text-sm text-violet-700">
                    This challenge is clear enough for student teams to start
                    working.
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-green-600">
                  4/4 passed
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <ReviewItem text="Problem is specific" />
                <ReviewItem text="Target users identified" />
                <ReviewItem text="Success is measurable" />
                <ReviewItem text="Expected result defined" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="flex-1 rounded-2xl border border-gray-200 px-6 py-4 font-semibold transition hover:bg-gray-50">
            Edit challenge
          </button>

          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800">
            Publish challenge
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-gray-100 py-7 last:border-0">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <p className="mt-3 max-w-3xl leading-7 text-gray-700">{text}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
      {children}
    </span>
  );
}

function Skill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
      {children}
    </span>
  );
}

function InfoBox({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <p className="font-semibold">{title}</p>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm leading-6 text-gray-600"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm font-medium text-violet-900">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">
        ✓
      </span>

      {text}
    </div>
  );
}