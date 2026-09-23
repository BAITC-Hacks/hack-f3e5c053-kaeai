"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  BriefcaseBusiness,
  GraduationCap,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  apiFetch,
  LoginResponse,
} from "../../lib/api";

type Mode = "login" | "register";
type Role = "business" | "student";

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("business");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (
      !email.trim() ||
      !password.trim() ||
      (mode === "register" && !fullName.trim())
    ) {
      setError(
        language === "ru"
          ? "Заполните все обязательные поля."
          : language === "kk"
            ? "Барлық міндетті өрістерді толтырыңыз."
            : "Please complete all required fields."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint =
        mode === "register"
          ? "/api/auth/register"
          : "/api/auth/login";

      const body =
        mode === "register"
          ? {
              full_name: fullName.trim(),
              email: email.trim(),
              password,
              role,
            }
          : {
              email: email.trim(),
              password,
            };

      const result = await apiFetch<LoginResponse>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      login(
        {
          id: result.user.id,
          name: result.user.full_name,
          email: result.user.email,
          role: result.user.role,
        },
        result.access_token
      );

      if (result.user.role === "business") {
        router.push("/dashboard");
      } else {
        router.push("/challenges");
      }
    } catch (error) {
      console.error(error);

      setError(
        language === "ru"
          ? mode === "register"
            ? "Не удалось зарегистрироваться."
            : "Не удалось войти. Проверьте email и пароль."
          : language === "kk"
            ? mode === "register"
              ? "Тіркелу мүмкін болмады."
              : "Кіру мүмкін болмады. Email және құпиясөзді тексеріңіз."
            : mode === "register"
              ? "Could not create account."
              : "Could not sign in. Check email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5 py-10 text-gray-950">
      <div className="w-full max-w-lg rounded-[32px] border border-gray-200 bg-white p-8 shadow-xl shadow-black/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <BrainCircuit size={22} />
            </div>

            <div>
              <p className="font-bold">{t("app")}</p>
              <p className="text-xs text-gray-400">
                AI Sana
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1">
            {(["kk", "ru", "en"] as const).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setLanguage(item)}
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
        </div>

        <div className="mt-8 flex rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500"
            }`}
          >
            {language === "ru"
              ? "Войти"
              : language === "kk"
                ? "Кіру"
                : "Sign in"}
          </button>

          <button
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500"
            }`}
          >
            {language === "ru"
              ? "Регистрация"
              : language === "kk"
                ? "Тіркелу"
                : "Sign up"}
          </button>
        </div>

        <h1 className="mt-8 text-3xl font-bold">
          {mode === "login"
            ? language === "ru"
              ? "С возвращением"
              : language === "kk"
                ? "Қайта қош келдіңіз"
                : "Welcome back"
            : language === "ru"
              ? "Создать аккаунт"
              : language === "kk"
                ? "Аккаунт құру"
                : "Create account"}
        </h1>

        <p className="mt-2 text-gray-500">
          {mode === "login"
            ? language === "ru"
              ? "Войдите, чтобы продолжить."
              : language === "kk"
                ? "Жалғастыру үшін кіріңіз."
                : "Sign in to continue."
            : language === "ru"
              ? "Выберите роль и зарегистрируйтесь."
              : language === "kk"
                ? "Рөліңізді таңдап, тіркеліңіз."
                : "Choose your role and register."}
        </p>

        {mode === "register" && (
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole("business")}
              className={`rounded-2xl border p-5 text-left transition ${
                role === "business"
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <BriefcaseBusiness size={23} />

              <p className="mt-4 font-bold">
                {t("business")}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {t("createManage")}
              </p>
            </button>

            <button
              onClick={() => setRole("student")}
              className={`rounded-2xl border p-5 text-left transition ${
                role === "student"
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <GraduationCap size={23} />

              <p className="mt-4 font-bold">
                {t("student")}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {t("exploreApply")}
              </p>
            </button>
          </div>
        )}

        <div className="mt-7 space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-sm font-semibold">
                {role === "business"
                  ? language === "ru"
                    ? "Название организации"
                    : language === "kk"
                      ? "Ұйым атауы"
                      : "Organization name"
                  : language === "ru"
                    ? "Название команды"
                    : language === "kk"
                      ? "Команда атауы"
                      : "Team name"}
              </label>

              <input
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder={
                  role === "business"
                    ? "AI Sana"
                    : "Quantum Team"
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="team@example.com"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              {language === "ru"
                ? "Пароль"
                : language === "kk"
                  ? "Құпиясөз"
                  : "Password"}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300"
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              {language === "ru"
                ? "Подождите..."
                : language === "kk"
                  ? "Күтіңіз..."
                  : "Please wait..."}
            </>
          ) : mode === "login" ? (
            language === "ru" ? (
              "Войти"
            ) : language === "kk" ? (
              "Кіру"
            ) : (
              "Sign in"
            )
          ) : language === "ru" ? (
            "Зарегистрироваться"
          ) : language === "kk" ? (
            "Тіркелу"
          ) : (
            "Create account"
          )}
        </button>
      </div>
    </main>
  );
}