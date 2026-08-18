"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Не удалось выполнить вход");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-10 text-[#2f241f]">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[32px] bg-white p-8 shadow-xl">

          <div className="mb-8 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#9b7358]">
              Хмельбург
            </p>

            <h1 className="text-3xl font-bold">
              Вход администратора
            </h1>

            <p className="mt-2 text-[#74655d]">
              Управление бронированиями ресторана
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Логин
              </label>

              <input
                type="text"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                placeholder="Введите логин"
                autoComplete="username"
                className="w-full rounded-2xl border border-[#ddd1c8] bg-[#faf7f4] px-4 py-3 outline-none transition focus:border-[#7b4f35] focus:ring-2 focus:ring-[#7b4f35]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Пароль
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-[#ddd1c8] bg-[#faf7f4] px-4 py-3 outline-none transition focus:border-[#7b4f35] focus:ring-2 focus:ring-[#7b4f35]/20"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#7b4f35] px-5 py-3.5 font-semibold text-white transition hover:bg-[#69432e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Выполняется вход..." : "Войти"}
            </button>

          </form>

          <a
            href="/"
            className="mt-5 block text-center text-sm font-medium text-[#7b4f35] hover:underline"
          >
            ← Вернуться на главную
          </a>

        </div>
      </div>
    </main>
  );
}