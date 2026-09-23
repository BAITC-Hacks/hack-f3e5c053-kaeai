"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";

import {
  apiFetch,
  Application,
  Challenge,
} from "@/lib/api";

export default function ChallengeDetailsPage() {
  const params = useParams();

  const challengeId = Number(params.id);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applyOpen, setApplyOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadChallenge() {
      if (!challengeId) return;

      try {
        setLoading(true);
        setError("");

        const challengeData = await apiFetch<Challenge>(
          `/api/challenges/${challengeId}`
        );

        setChallenge(challengeData);

        try {
          const applicationData = await apiFetch<Application[]>(
            `/api/challenges/${challengeId}/applications`
          );

          setApplications(applicationData);
        } catch (applicationError) {
          console.error(
            "Could not load applications:",
            applicationError
          );

          setApplications([]);
        }
      } catch (error) {
        console.error(error);
        setError("Could not load this challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadChallenge();
  }, [challengeId]);

  function applicationSubmitted(application: Application) {
    setApplications((previous) => [
      ...previous,
      application,
    ]);

    setSubmitted(true);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-violet-600"
          />

          <p className="mt-4 font-semibold">
            Loading challenge...
          </p>
        </div>
      </main>
    );
  }

  if (error || !challenge) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Challenge unavailable
          </h1>

          <p className="mt-3 text-gray-500">
            {error || "This challenge could not be found."}
          </p>

          <Link
            href="/challenges"
            className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-950">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <BrainCircuit size={21} />
            </div>

            <div>
              <p className="font-bold">
                AI Sana Challenge Hub
              </p>

              <p className="text-xs text-gray-400">
                Challenge details
              </p>
            </div>
          </Link>

          <Link
            href="/challenges"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
          >
            Marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/challenges"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to challenges
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section>
            {/* HEADER CARD */}
            <div className="rounded-[30px] border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col justify-between gap-6 md:flex-row">
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
                      {challenge.status}
                    </span>

                    {challenge.recommended_skills
                      .slice(0, 2)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>

                  <h1 className="max-w-3xl text-4xl font-bold tracking-tight">
                    {challenge.title ||
                      "Untitled Challenge"}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness size={17} />
                      AI Sana Business Challenge
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={17} />
                      {applications.length}{" "}
                      {applications.length === 1
                        ? "team applied"
                        : "teams applied"}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={17} />
                      Open challenge
                    </div>
                  </div>
                </div>

                <div className="h-fit rounded-2xl bg-green-50 px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                    Readiness
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-700">
                    {challenge.readiness_score}/100
                  </p>
                </div>
              </div>

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${challenge.readiness_score}%`,
                  }}
                />
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="mt-6 rounded-[30px] border border-gray-200 bg-white p-8">
              <ContentSection
                icon={<Target size={19} />}
                title="Problem"
                text={
                  challenge.problem ||
                  challenge.raw_description ||
                  "Not specified"
                }
              />

              <ContentSection
                icon={<Sparkles size={19} />}
                title="Goal"
                text={
                  challenge.goal || "Not specified"
                }
              />

              <ContentSection
                icon={<Users size={19} />}
                title="Target users"
                text={
                  challenge.target_users ||
                  "Not specified"
                }
              />

              <ContentSection
                icon={<CheckCircle2 size={19} />}
                title="Expected result"
                text={
                  challenge.expected_result ||
                  "Not specified"
                }
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InfoCard
                title="Success metrics"
                items={challenge.success_metrics}
              />

              <InfoCard
                title="Constraints"
                items={challenge.constraints}
              />
            </div>

            {/* SKILLS */}
            <div className="mt-6 rounded-[30px] border border-gray-200 bg-white p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Recommended skills
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {challenge.recommended_skills.length >
                0 ? (
                  challenge.recommended_skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700"
                      >
                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    Skills not specified.
                  </p>
                )}
              </div>
            </div>

            {/* QUALITY */}
            <div className="mt-6 rounded-[30px] border border-violet-100 bg-violet-50 p-7">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="font-bold text-violet-950">
                    AI Quality Review
                  </p>

                  <p className="mt-2 leading-7 text-violet-700">
                    This challenge has been refined
                    using AI and includes structured
                    information for student teams.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside>
            <div className="sticky top-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">
                Interested in this challenge?
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Apply with your team.
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Tell the business about your team and
                why you are a good fit for this
                challenge.
              </p>

              <button
                onClick={() => {
                  setApplyOpen(true);
                  setSubmitted(false);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800"
              >
                Apply as a team
                <Send size={18} />
              </button>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Challenge status
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Open for applications
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {applyOpen && (
        <ApplyModal
          challengeId={challenge.id}
          submitted={submitted}
          onClose={() => setApplyOpen(false)}
          onSubmitted={applicationSubmitted}
        />
      )}
    </main>
  );
}

function ContentSection({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-gray-100 py-7 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          {icon}
        </div>

        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <p className="mt-4 max-w-4xl leading-7 text-gray-600">
        {text}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[26px] border border-gray-200 bg-white p-6">
      <h3 className="font-bold">{title}</h3>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-6 text-gray-600"
            >
              <CheckCircle2
                size={17}
                className="mt-1 shrink-0 text-green-600"
              />

              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          Not specified.
        </p>
      )}
    </div>
  );
}

function ApplyModal({
  challengeId,
  submitted,
  onClose,
  onSubmitted,
}: {
  challengeId: number;
  submitted: boolean;
  onClose: () => void;
  onSubmitted: (application: Application) => void;
}) {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] =
    useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submitApplication() {
    if (
      !teamName.trim() ||
      !teamDescription.trim() ||
      !contact.trim() ||
      !message.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const application =
        await apiFetch<Application>(
          `/api/challenges/${challengeId}/applications`,
          {
            method: "POST",
            body: JSON.stringify({
              team_name: teamName,
              team_description: teamDescription,
              contact,
              message,
            }),
          }
        );

      onSubmitted(application);
    } catch (error) {
      console.error(error);

      setError(
        "Could not submit the application."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Team application
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Apply to this challenge
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {!submitted ? (
          <>
            <div className="mt-7 space-y-5">
              <div>
                <label className="text-sm font-semibold">
                  Team name
                </label>

                <input
                  value={teamName}
                  onChange={(event) =>
                    setTeamName(event.target.value)
                  }
                  placeholder="Example: Quantum Team"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Team description
                </label>

                <textarea
                  value={teamDescription}
                  onChange={(event) =>
                    setTeamDescription(
                      event.target.value
                    )
                  }
                  placeholder="Tell the business about your team, skills and experience..."
                  className="mt-2 min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Contact
                </label>

                <input
                  value={contact}
                  onChange={(event) =>
                    setContact(event.target.value)
                  }
                  placeholder="Email, Telegram or phone number"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Why is your team a good fit?
                </label>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Briefly describe your approach to this challenge..."
                  className="mt-2 min-h-[130px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-violet-500 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={submitApplication}
              disabled={sending}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300"
            >
              {sending ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit application
                  <Send size={18} />
                </>
              )}
            </button>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={30} />
            </div>

            <h3 className="mt-5 text-2xl font-bold">
              Application submitted
            </h3>

            <p className="mx-auto mt-3 max-w-sm leading-7 text-gray-500">
              Your application was saved. The business
              can now review your team.
            </p>

            <button
              onClick={onClose}
              className="mt-7 rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}