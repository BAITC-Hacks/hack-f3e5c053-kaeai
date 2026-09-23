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
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

import AppHeader from "@/components/AppHeader";
import {
  apiFetch,
  Application,
  Challenge,
} from "@/lib/api";

import { useLanguage } from "@/context/LanguageContext";

type ChallengeWithApplications = {
  challenge: Challenge;
  applications: Application[];
};

export default function DashboardPage() {
  const { t } = useLanguage();

  const [data, setData] = useState<
    ChallengeWithApplications[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] =
    useState<Record<number, number>>({});

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const challenges =
          await apiFetch<Challenge[]>(
            "/api/challenges/mine"
          );

        const fullData =
          await Promise.all(
            challenges.map(
              async (challenge) => {
                try {
                  const applications =
                    await apiFetch<Application[]>(
                      `/api/challenges/${challenge.id}/applications`
                    );

                  return {
                    challenge,
                    applications,
                  };
                } catch {
                  return {
                    challenge,
                    applications: [],
                  };
                }
              }
            )
          );

        setData(fullData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const applicationCount = useMemo(
    () =>
      data.reduce(
        (total, item) =>
          total + item.applications.length,
        0
      ),
    [data]
  );

  const averageReadiness = useMemo(() => {
    if (!data.length) return 0;

    return Math.round(
      data.reduce(
        (total, item) =>
          total +
          item.challenge.readiness_score,
        0
      ) / data.length
    );
  }, [data]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-950">
      <AppHeader
        subtitle={t("businessWorkspace")}
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              <BriefcaseBusiness size={16} />
              {t("businessWorkspace")}
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">
              {t("yourChallenges")}
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              {t("dashboardText")}
            </p>
          </div>

          <Link
            href="/create"
            className="rounded-xl bg-black px-5 py-3 text-center font-semibold text-white"
          >
            {t("create")}
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <StatCard
            title={t("active")}
            value={data.length}
            icon={<BriefcaseBusiness size={20} />}
          />

          <StatCard
            title={t("applications")}
            value={applicationCount}
            icon={<Users size={20} />}
          />

          <StatCard
            title={t("averageReadiness")}
            value={`${averageReadiness}/100`}
            icon={<Sparkles size={20} />}
          />
        </div>

        {loading && (
          <div className="py-24 text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-violet-600"
            />
          </div>
        )}

        {!loading && (
          <div className="mt-8 space-y-8">
            {data.map(
              ({ challenge, applications }) => (
                <section
                  key={challenge.id}
                  className="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-sm"
                >
                  <div className="border-b border-gray-100 p-7">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div>
                        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                          {challenge.status === "published" ? t("published") : challenge.status}
                        </span>

                        <h2 className="mt-4 text-2xl font-bold">
                          {challenge.title ||
                            "Untitled Challenge"}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                          {applications.length}{" "}
                          {t("applications").toLowerCase()}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-green-50 px-5 py-4">
                        <p className="text-xs font-bold uppercase text-green-600">
                          {t("readiness")}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-700">
                          {challenge.readiness_score}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-7">
                    <h3 className="text-xl font-bold">
                      {t("teamApplications")}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {t("compareTeams")}
                    </p>

                    {applications.length === 0 ? (
                      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
                        {t("noApplications")}
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {applications.map(
                          (application) => {
                            const selected =
                              (selectedTeams[challenge.id] ??
                                applications.find((item) => item.status === "selected")?.id) === application.id;

                            return (
                              <div
                                key={
                                  application.id
                                }
                                className={`rounded-[24px] border p-6 ${
                                  selected
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-200"
                                }`}
                              >
                                <div className="flex flex-col justify-between gap-6 lg:flex-row">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h4 className="text-xl font-bold">
                                        {
                                          application.team_name
                                        }
                                      </h4>

                                      {selected && (
                                        <span className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                                          <CheckCircle2
                                            size={
                                              13
                                            }
                                          />
                                          {t(
                                            "selected"
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-4 max-w-2xl leading-7 text-gray-600">
                                      {
                                        application.team_description
                                      }
                                    </p>

                                    <p className="mt-3 text-sm text-gray-500">
                                      {
                                        application.message
                                      }
                                    </p>

                                    <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm">
                                      <span className="font-semibold">
                                        {t(
                                          "contactTeam"
                                        )}
                                        :
                                      </span>{" "}
                                      {
                                        application.contact
                                      }
                                    </div>
                                  </div>

                                  <div className="w-full lg:w-48">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await apiFetch(`/api/applications/${application.id}/select`, { method: "POST" });
                                          setSelectedTeams((previous) => ({ ...previous, [challenge.id]: application.id }));
                                        } catch (error) {
                                          console.error(error);
                                          alert("Could not select this team.");
                                        }
                                      }}
                                      disabled={
                                        selected
                                      }
                                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold ${
                                        selected
                                          ? "bg-green-600 text-white"
                                          : "bg-black text-white"
                                      }`}
                                    >
                                      {selected ? (
                                        <>
                                          <CheckCircle2
                                            size={
                                              17
                                            }
                                          />
                                          {t(
                                            "selected"
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          {t(
                                            "selectTeam"
                                          )}
                                          <ArrowRight
                                            size={
                                              17
                                            }
                                          />
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        {icon}
      </div>

      <p className="mt-6 text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
