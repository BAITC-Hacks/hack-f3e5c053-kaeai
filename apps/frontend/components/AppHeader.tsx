"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AppHeader({
  subtitle,
}: {
  subtitle?: string;
}) {
  const router = useRouter();

  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  function signOut() {
    logout();
    router.push("/");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <BrainCircuit size={21} />
          </div>

          <div>
            <p className="font-bold">{t("app")}</p>

            {subtitle && (
              <p className="text-xs text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-xl bg-gray-100 p-1">
            {(["kk", "ru", "en"] as const).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setLanguage(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    language === item
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              )
            )}
          </div>

          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400">
                  {user.role === "business"
                    ? t("business")
                    : t("student")}
                </p>
              </div>

              <button
                onClick={signOut}
                title={t("logout")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}