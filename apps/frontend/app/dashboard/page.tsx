"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Sparkles,
  Users,
} from "lucide-react";

const applications = [
  {
    id: 1,
    team: "Quantum Team",
    skills: ["Python", "AI", "FastAPI", "React"],
    match: 92,
    members: 3,
    status: "Pending",
    description:
      "We have experience building AI-powered web applications and API integrations.",
  },
  {
    id: 2,
    team: "CodeNomads",
    skills: ["Python", "NLP", "React"],
    match: 86,
    members: 4,
    status: "Pending",
    description:
      "Our team has worked with NLP classification and customer support automation.",
  },
  {
    id: 3,
    team: "Vision Labs",
    skills: ["ML", "Python", "Data"],
    match: 78,
    members: 3,
    status: "Pending",
    description:
      "We focus on machine learning prototypes and business data analysis.",
  },
];

export default function DashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-950">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <BrainCircuit size={21} />
            </div>

            <div>
              <p className="font-bold">AI Sana Challenge Hub</p>
              <p className="text-xs text-gray-400">Business dashboard</p>
            </div>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/challenges"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
            >
              Marketplace
            </Link>

            <Link
              href="/create"
              className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"
            >
              New challenge
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            <BriefcaseBusiness size={16} />
            Business workspace
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Your challenges
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Track published challenges and review student team applications.
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            title="Active challenges"
            value="1"
            icon={<BriefcaseBusiness size={20} />}
          />

          <StatCard
            title="Applications"
            value="3"
            icon={<Users size={20} />}
          />

          <StatCard
            title="Average readiness"
            value="89"
            suffix="/100"
            icon={<Sparkles size={20} />}
          />
        </div>

        {/* CHALLENGE */}
        <section className="mt-8 rounded-[30px] border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                    Published
                  </span>

                  <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
                    AI
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-bold">
                  AI-Powered Customer Support Automation
                </h2>

                <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Clock3 size={16} />
                    Published today
                  </span>

                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    3 applications
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-green-50 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                  Readiness
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  89/100
                </p>
              </div>
            </div>
          </div>

          <div className="p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Team applications</h3>

                <p className="mt-1 text-sm text-gray-500">
                  Compare teams and choose who you want to work with.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {applications.map((application) => {
                const isSelected = selectedTeam === application.id;

                return (
                  <div
                    key={application.id}
                    className={`rounded-[24px] border p-6 transition ${
                      isSelected
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-xl font-bold">
                            {application.team}
                          </h4>

                          {isSelected && (
                            <span className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                              <CheckCircle2 size={13} />
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          <Users size={16} />
                          {application.members} members
                        </div>

                        <p className="mt-4 max-w-2xl leading-7 text-gray-600">
                          {application.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {application.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="w-full lg:w-[220px]">
                        <div className="rounded-2xl bg-violet-50 p-4 text-center">
                          <p className="text-xs font-bold uppercase tracking-wider text-violet-500">
                            Skill match
                          </p>

                          <p className="mt-1 text-3xl font-bold text-violet-700">
                            {application.match}%
                          </p>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
                            <div
                              className="h-full rounded-full bg-violet-600"
                              style={{ width: `${application.match}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedTeam(application.id)}
                          disabled={isSelected}
                          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${
                            isSelected
                              ? "cursor-default bg-green-600 text-white"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 size={17} />
                              Team selected
                            </>
                          ) : (
                            <>
                              Select team
                              <ArrowRight size={17} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon,
}: {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        {icon}
      </div>

      <p className="mt-6 text-sm font-medium text-gray-500">{title}</p>

      <p className="mt-1 text-3xl font-bold">
        {value}
        {suffix && (
          <span className="text-lg font-semibold text-gray-400">{suffix}</span>
        )}
      </p>
    </div>
  );
}