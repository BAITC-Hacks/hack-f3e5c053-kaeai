"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "AI-Powered Customer Support Automation",
    company: "Retail Company",
    category: "AI",
    description:
      "Build an AI-assisted solution that automatically categorizes and routes incoming customer support requests.",
    skills: ["Python", "AI / ML", "NLP", "FastAPI"],
    readiness: 89,
    applications: 6,
  },
  {
    id: 2,
    title: "University Energy Consumption Optimizer",
    company: "Smart Campus",
    category: "Energy",
    description:
      "Analyze building consumption data and propose a system that identifies energy waste and optimization opportunities.",
    skills: ["Python", "Data Analysis", "ML"],
    readiness: 94,
    applications: 4,
  },
  {
    id: 3,
    title: "Cybersecurity Incident Prioritization",
    company: "Digital Services",
    category: "Cybersecurity",
    description:
      "Create a system that helps security teams prioritize incoming alerts using risk and business impact.",
    skills: ["Cybersecurity", "Python", "AI"],
    readiness: 82,
    applications: 9,
  },
  {
    id: 4,
    title: "Student Dropout Risk Detection",
    company: "Education Center",
    category: "Education",
    description:
      "Develop a prototype that identifies students who may require early academic support.",
    skills: ["Data Science", "Python", "ML"],
    readiness: 91,
    applications: 5,
  },
  {
    id: 5,
    title: "Intelligent Logistics Route Planning",
    company: "Logistics Company",
    category: "Logistics",
    description:
      "Improve delivery planning by considering distance, workload and operational constraints.",
    skills: ["Algorithms", "Python", "Optimization"],
    readiness: 86,
    applications: 3,
  },
  {
    id: 6,
    title: "Document Processing Assistant",
    company: "Business Services",
    category: "AI",
    description:
      "Automatically extract and structure information from incoming business documents.",
    skills: ["OCR", "NLP", "Python"],
    readiness: 88,
    applications: 7,
  },
];

const categories = [
  "All",
  "AI",
  "Education",
  "Cybersecurity",
  "Energy",
  "Logistics",
];

export default function ChallengesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const matchesCategory =
        category === "All" || challenge.category === category;

      const query = search.toLowerCase();

      const matchesSearch =
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query) ||
        challenge.skills.some((skill) => skill.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

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
              <p className="text-xs text-gray-400">Challenge marketplace</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="hidden rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 sm:block"
            >
              Create challenge
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              <Sparkles size={16} />
              Challenge Marketplace
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Find a real business problem worth solving.
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Explore structured challenges published by organizations and find
              the right project for your team.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <BriefcaseBusiness size={18} />
            {challenges.length} active challenges
          </div>
        </div>

        <div className="mt-12 rounded-[24px] border border-gray-200 bg-white p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by challenge, skill or technology..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-violet-500 focus:bg-white"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Showing {filteredChallenges.length} challenges
          </p>

          <select className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none">
            <option>Recommended</option>
            <option>Highest readiness</option>
            <option>Most applications</option>
          </select>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-dashed border-gray-300 bg-white py-20 text-center">
            <p className="text-lg font-semibold">No challenges found</p>
            <p className="mt-2 text-gray-500">
              Try another search or category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function ChallengeCard({
  challenge,
}: {
  challenge: {
    id: number;
    title: string;
    company: string;
    category: string;
    description: string;
    skills: string[];
    readiness: number;
    applications: number;
  };
}) {
  return (
    <article className="group flex h-full flex-col rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
          {challenge.category}
        </span>

        <div className="text-right">
          <p className="text-xs text-gray-400">Readiness</p>
          <p className="text-lg font-bold text-green-600">
            {challenge.readiness}/100
          </p>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold leading-snug tracking-tight">
        {challenge.title}
      </h2>

      <p className="mt-2 text-sm font-medium text-gray-400">
        {challenge.company}
      </p>

      <p className="mt-5 flex-1 leading-7 text-gray-600">
        {challenge.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {challenge.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={17} />
          {challenge.applications} teams applied
        </div>

        <Link
          href={`/challenges/${challenge.id}`}
          className="flex items-center gap-1.5 text-sm font-bold transition group-hover:text-violet-600"
        >
          View
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}