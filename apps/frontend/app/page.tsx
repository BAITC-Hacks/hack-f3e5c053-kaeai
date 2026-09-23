"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { language, setLanguage, t } =
    useLanguage();

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-950">
      <header className="border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <BrainCircuit size={22} />
            </div>

            <div>
              <p className="font-bold">
                {t("app")}
              </p>

              <p className="text-xs text-gray-500">
                {t("homeSubtitle")}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-gray-100 p-1">
              {(["kk", "ru", "en"] as const).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setLanguage(item)
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      language === item
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    {item.toUpperCase()}
                  </button>
                )
              )}
            </div>

            <Link
              href="/login"
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              <Sparkles size={16} />
              {t("powered")}
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.04em] md:text-7xl">
              {t("hero1")}
              <span className="block text-violet-600">
                {t("hero2")}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
              {t("heroText")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-2xl bg-black px-7 py-4 font-semibold text-white"
              >
                {t("startChallenge")}
                <ArrowRight size={19} />
              </Link>

              <Link
                href="/challenges"
                className="rounded-2xl border border-gray-200 bg-white px-7 py-4 text-center font-semibold"
              >
                {t("explore")}
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-7 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-600"
                />
                AI clarification
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-600"
                />
                Readiness score
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-600"
                />
                Team applications
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-2xl shadow-black/10">
            <p className="text-sm text-gray-500">
              {t("readiness")}
            </p>

            <div className="mt-2 flex items-center justify-between gap-5">
              <h3 className="text-2xl font-bold">
                Customer Support Automation
              </h3>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-50 text-lg font-bold text-green-700">
                87
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[87%] rounded-full bg-green-500" />
            </div>

            <div className="mt-8 space-y-3">
              <DemoItem
                icon={<Target size={18} />}
                text={t("problem")}
              />

              <DemoItem
                icon={<Users size={18} />}
                text={t("targetUsers")}
              />

              <DemoItem
                icon={<Zap size={18} />}
                text={t("successMetrics")}
              />
            </div>

            <div className="mt-7 rounded-2xl bg-violet-50 p-5">
              <div className="flex gap-3">
                <Sparkles
                  size={20}
                  className="mt-1 text-violet-600"
                />

                <p className="text-sm leading-6 text-violet-800">
                  AI transforms an unclear problem into a
                  structured challenge with goals, metrics
                  and required skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DemoItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
        {icon}
      </div>

      <span className="font-medium">{text}</span>

      <CheckCircle2
        size={17}
        className="ml-auto text-green-600"
      />
    </div>
  );
}