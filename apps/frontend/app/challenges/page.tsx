"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import AppHeader from "@/components/AppHeader";
import { apiFetch, Challenge } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const categories = [
  "All",
  "AI",
  "Python",
  "Data",
  "Cybersecurity",
];

export default function ChallengesPage() {
  const { t } = useLanguage();

  const [challenges, setChallenges] = useState<
    Challenge[]
  >([]);

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
    const query = search.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const skills =
        challenge.recommended_skills || [];

      const matchesSearch =
        !query ||
        (challenge.title || "")
          .toLowerCase()
          .includes(query) ||
        (challenge.problem || "")
          .toLowerCase()
          .includes(query) ||
        (challenge.raw_description || "")
          .toLowerCase()
          .includes(query) ||
        skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesCategory =
        category === "All" ||
        skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(category.toLowerCase())
        );

      return matchesSearch && matchesCategory;
    });
  }, [challenges, search, category]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-950">
      <AppHeader
        subtitle={t("challengeMarketplace")}
      />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              <Sparkles size={16} />
              {t("challengeMarketplace")}
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              {t("marketplaceTitle")}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              {t("marketplaceText")}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <BriefcaseBusiness size={18} />
            {challenges.length} {t("activeChallenges")}
          </div>
        </div>

        <div className="mt-10 rounded-[24px] border border-gray-200 bg-white p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder={t("search")}
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  category === item
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm font-medium text-gray-500">
          {t("showing")}{" "}
          {filteredChallenges.length}{" "}
          {t("challenges").toLowerCase()}
        </p>

        {loading && (
          <div className="py-20 text-center">
            <Loader2
              className="mx-auto animate-spin text-violet-600"
              size={30}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
              />
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          filteredChallenges.length === 0 && (
            <div className="mt-8 rounded-[28px] border border-dashed border-gray-300 bg-white py-20 text-center">
              <p className="text-lg font-semibold">
                {t("noChallenges")}
              </p>

              <p className="mt-2 text-gray-500">
                {t("noChallengesText")}
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
  challenge: Challenge;
}) {
  const { t } = useLanguage();

  const skills =
    challenge.recommended_skills || [];

  return (
    <article className="group flex h-full flex-col rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
          {t("published")}
        </span>

        <div className="text-right">
          <p className="text-xs text-gray-400">
            {t("readiness")}
          </p>

          <p className="text-lg font-bold text-green-600">
            {challenge.readiness_score}/100
          </p>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold">
        {challenge.title || "Untitled Challenge"}
      </h2>

      <p className="mt-5 flex-1 leading-7 text-gray-600">
        {challenge.problem ||
          challenge.raw_description ||
          t("notSpecified")}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {skills.slice(0, 4).map((skill) => (
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
          {t("openApplications")}
        </div>

        <Link
          href={`/challenges/${challenge.id}`}
          className="flex items-center gap-1.5 text-sm font-bold group-hover:text-violet-600"
        >
          {t("view")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}