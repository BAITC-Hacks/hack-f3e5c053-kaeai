"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch, Challenge } from "@/lib/api";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function CreateChallenge() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [analyzed, setAnalyzed] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  async function analyzeProblem() {
    if (!description.trim()) return;

    try {
      setLoading(true);

      const result = await apiFetch<Challenge>("/api/challenges", {
        method: "POST",
        body: JSON.stringify({
          description,
        }),
      });

      setChallenge(result);
      setAnalyzed(true);
    } catch (error) {
      console.error(error);
      alert("Could not analyze the challenge.");
    } finally {
      setLoading(false);
    }
  }

  async function generateChallenge() {
    if (!challenge) return;

    try {
      setLoading(true);

      await apiFetch<Challenge>(
        `/api/challenges/${challenge.id}/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            answers: challenge.questions.map((question) => ({
              question_id: question.id,
              answer: answers[question.id] || "",
            })),
          }),
        }
      );

      const generatedChallenge = await apiFetch<Challenge>(
        `/api/challenges/${challenge.id}/generate`,
        {
          method: "POST",
        }
      );

      setChallenge(generatedChallenge);
      setGenerated(true);
    } catch (error) {
      console.error(error);
      alert("Could not generate the challenge.");
    } finally {
      setLoading(false);
    }
  }

  async function publishChallenge() {
    if (!challenge) return;

    try {
      setLoading(true);

      await apiFetch<Challenge>(
        `/api/challenges/${challenge.id}/publish`,
        {
          method: "POST",
        }
      );

      router.push("/challenges");
    } catch (error) {
      console.error(error);
      alert("Could not publish the challenge.");
    } finally {
      setLoading(false);
    }
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
                Describe the problem in your own words. AI will help clarify it
                and turn it into a structured challenge.
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
            challenge={challenge}
            answers={answers}
            setAnswers={setAnswers}
            onGenerate={generateChallenge}
            loading={loading}
          />
        ) : (
          <GeneratedChallenge
            challenge={challenge}
            onPublish={publishChallenge}
            loading={loading}
          />
        )}
      </div>
    </main>
  );
}

function AnalysisResult({
  challenge,
  answers,
  setAnswers,
  onGenerate,
  loading,
}: {
  challenge: Challenge | null;
  answers: Record<number, string>;
  setAnswers: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  onGenerate: () => void;
  loading: boolean;
}) {
  const score = challenge?.readiness_score ?? 0;

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

            <p className="mt-1 text-3xl font-bold">{score}/100</p>
          </div>

          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            Needs clarification
          </span>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-orange-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {challenge?.questions.map((item, index) => (
          <Question
            key={item.id}
            number={index + 1}
            question={item.question}
            value={answers[item.id] || ""}
            onChange={(value) =>
              setAnswers((previous) => ({
                ...previous,
                [item.id]: value,
              }))
            }
          />
        ))}
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
  value,
  onChange,
}: {
  number: number;
  question: string;
  value: string;
  onChange: (value: string) => void;
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
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter your answer..."
            className="mt-4 min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-violet-500 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
}

function GeneratedChallenge({
  challenge,
  onPublish,
  loading,
}: {
  challenge: Challenge | null;
  onPublish: () => void;
  loading: boolean;
}) {
  if (!challenge) return null;

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

      <div className="mb-6 rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Challenge readiness
            </p>

            <p className="mt-2 text-4xl font-bold">
              {challenge.readiness_score}/100
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            Ready to publish
          </span>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${challenge.readiness_score}%` }}
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 border-b border-gray-100 pb-7 md:flex-row">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {challenge.recommended_skills.slice(0, 3).map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              {challenge.title || "Untitled Challenge"}
            </h2>

            <p className="mt-3 text-gray-500">
              AI Sana Business Challenge
            </p>
          </div>

          <div className="h-fit rounded-2xl bg-violet-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
              Readiness
            </p>

            <p className="mt-1 text-2xl font-bold text-violet-800">
              {challenge.readiness_score}/100
            </p>
          </div>
        </div>

        <Section
          title="Problem"
          text={challenge.problem || "Not specified"}
        />

        <Section
          title="Goal"
          text={challenge.goal || "Not specified"}
        />

        <Section
          title="Target users"
          text={challenge.target_users || "Not specified"}
        />

        <Section
          title="Expected result"
          text={challenge.expected_result || "Not specified"}
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoBox
            title="Success metrics"
            items={challenge.success_metrics}
          />

          <InfoBox
            title="Constraints"
            items={challenge.constraints}
          />
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Recommended skills
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {challenge.recommended_skills.map((skill) => (
              <Skill key={skill}>{skill}</Skill>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Sparkles size={19} />
            </div>

            <div className="w-full">
              <p className="font-bold text-violet-950">
                AI Quality Review
              </p>

              <p className="mt-1 text-sm text-violet-700">
                This challenge now contains a structured problem, target users,
                measurable success criteria and expected outcome.
              </p>

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
          <button
            type="button"
            className="flex-1 rounded-2xl border border-gray-200 px-6 py-4 font-semibold transition hover:bg-gray-50"
          >
            Edit challenge
          </button>

          <button
            onClick={onPublish}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Publishing...
              </>
            ) : (
              <>
                Publish challenge
                <ArrowRight size={19} />
              </>
            )}
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

      {items.length > 0 ? (
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
      ) : (
        <p className="mt-3 text-sm text-gray-500">Not specified</p>
      )}
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