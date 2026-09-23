"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Loader2,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import { apiFetch, Challenge } from "@/lib/api";

const categories = ["All", "AI", "Python", "Data", "Cybersecurity"];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    async function loadChallenges() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<Challenge[]>(
          "/api/challenges?status=published"
        );

        setChallenges(data);
      } catch (error) {
        console.error(error);
        setError("Could not load challenges.");
      } finally {
        setLoading(false);
      }
    }

    loadChallenges();
  }, []);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        (challenge.title || "").toLowerCase().includes(query) ||
        (challenge.problem || "").toLowerCase().includes(query) ||
        (challenge.raw_description || "").toLowerCase().includes(query) ||
        challenge.recommended_skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesCategory =
        category === "All" ||
        challenge.recommended_skills.some((skill) =>
          skill.toLowerCase().includes(category.toLowerCase())
        ) ||
        (challenge.title || "")
          .toLowerCase()
          .includes(category.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [challenges, search, category]);

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
          </select>
        </div>

        {loading && (
          <div className="mt-10 rounded-[28px] border border-gray-200 bg-white py-16 text-center">
            <Loader2
              size={28}
              className="mx-auto animate-spin text-violet-600"
            />

            <p className="mt-4 font-semibold">Loading challenges...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-[28px] border border-red-100 bg-red-50 py-12 text-center">
            <p className="font-semibold text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
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
          </>
        )}
      </section>
    </main>
  );
}

function ChallengeCard({
  challenge,
}: {
  challenge: Challenge;
}) {
  const previewSkills = challenge.recommended_skills.slice(0, 4);

  return (
    <article className="group flex h-full flex-col rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
          Published
        </span>

        <div className="text-right">
          <p className="text-xs text-gray-400">Readiness</p>

          <p className="text-lg font-bold text-green-600">
            {challenge.readiness_score}/100
          </p>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold leading-snug tracking-tight">
        {challenge.title || "Untitled Challenge"}
      </h2>

      <p className="mt-2 text-sm font-medium text-gray-400">
        AI Sana Business Challenge
      </p>

      <p className="mt-5 flex-1 leading-7 text-gray-600">
        {challenge.problem ||
          challenge.raw_description ||
          "No description available."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {previewSkills.length > 0 ? (
          previewSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400">
            Skills not specified
          </span>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={17} />
          Open for applications
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