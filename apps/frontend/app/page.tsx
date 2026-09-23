"use client";

import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#111827]">
      {/* NAVBAR */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <BrainCircuit size={22} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                AI Sana Challenge Hub
              </p>
              <p className="text-xs text-gray-500">
                Business problems → real challenges
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              How it works
            </a>

            <a
              href="#challenges"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Challenges
            </a>

            <Link href="/dashboard" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
              Open dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles size={16} />
              Powered by AI
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] md:text-7xl">
              Turn vague business problems into
              <span className="block text-violet-600">solvable challenges.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
              AI helps companies clarify their problem, identifies missing
              information and transforms an initial idea into a structured
              challenge students can actually solve.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/create"
                className="flex items-center justify-center gap-2 rounded-2xl bg-black px-7 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                Create a challenge
                <ArrowRight size={19} />
              </a>

              <Link href="/challenges" className="rounded-2xl border border-gray-200 bg-white px-7 py-4 font-semibold transition hover:border-gray-300">
                Explore challenges
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-7 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-600" />
                AI clarification
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-600" />
                Readiness score
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-600" />
                Team matching
              </div>
            </div>
          </div>

          {/* HERO PRODUCT CARD */}
          <div className="relative">
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl shadow-black/10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Challenge readiness</p>
                  <h3 className="mt-1 text-xl font-bold">
                    Customer Support Automation
                  </h3>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-lg font-bold text-green-700">
                  87
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[87%] rounded-full bg-green-500" />
              </div>

              <div className="mt-8 space-y-4">
                <QualityItem
                  icon={<Target size={18} />}
                  title="Problem definition"
                  status="Complete"
                />

                <QualityItem
                  icon={<Users size={18} />}
                  title="Target users"
                  status="Complete"
                />

                <QualityItem
                  icon={<Zap size={18} />}
                  title="Success metrics"
                  status="Complete"
                />

                <QualityItem
                  icon={<Building2 size={18} />}
                  title="Business constraints"
                  status="Needs detail"
                  warning
                />
              </div>

              <div className="mt-7 rounded-2xl bg-violet-50 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="font-semibold text-violet-950">
                      AI recommendation
                    </p>
                    <p className="mt-1 text-sm leading-6 text-violet-700">
                      Add information about available datasets and project
                      timeline to improve challenge quality.
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white">
                Ready to publish
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-semibold text-violet-600">HOW IT WORKS</p>

            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              From one sentence to a real project.
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Challenge Hub guides businesses through problem discovery before
              students ever see the task.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Step
              number="01"
              title="Describe the problem"
              description="A company submits a short description of the problem it wants to solve."
            />

            <Step
              number="02"
              title="AI asks the right questions"
              description="The system detects missing information and generates targeted clarification questions."
            />

            <Step
              number="03"
              title="Publish the challenge"
              description="A structured challenge with success criteria and readiness score enters the marketplace."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function QualityItem({
  icon,
  title,
  status,
  warning = false,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
          {icon}
        </div>

        <span className="font-medium">{title}</span>
      </div>

      <span
        className={`text-sm font-semibold ${
          warning ? "text-orange-600" : "text-green-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-[#fafafa] p-7">
      <span className="text-sm font-bold text-violet-600">{number}</span>

      <h3 className="mt-8 text-xl font-bold">{title}</h3>

      <p className="mt-3 leading-7 text-gray-600">{description}</p>
    </div>
  );
}
