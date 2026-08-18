"use client";

import { useSearchParams } from "next/navigation";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();

  const table = searchParams.get("table") ?? "3";
  const date = searchParams.get("date") ?? "15 августа 2026";
  const time = searchParams.get("time") ?? "19:00";

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#2f241f]">
      <header className="border-b border-[#e4d9ce] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-bold tracking-wide">
            ХМЕЛЬБУРГ
          </h1>

          <p className="text-sm text-[#806f63]">
            Онлайн-бронирование
          </p>
        </div>
      </header>

      <section className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6 py-14">
        <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl shadow-black/5 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f0e5dc] text-4xl">
            ✓
          </div>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5c3b]">
            Готово
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Бронирование создано!
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#6f625a]">
            Ваша заявка успешно оформлена. Сохраните информацию
            о бронировании или обратитесь к администратору ресторана
            при необходимости.
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[#f7f3ee] p-6 text-left">
            <div className="flex justify-between border-b border-[#e4d9ce] pb-4">
              <span className="text-[#806f63]">
                Столик
              </span>

              <span className="font-semibold">
                №{table}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#e4d9ce] py-4">
              <span className="text-[#806f63]">
                Дата
              </span>

              <span className="font-semibold">
                {date}
              </span>
            </div>

            <div className="flex justify-between pt-4">
              <span className="text-[#806f63]">
                Время
              </span>

              <span className="font-semibold">
                {time}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/"
              className="rounded-xl bg-[#7d422b] px-6 py-3 font-semibold text-white transition hover:bg-[#683521]"
            >
              На главную
            </a>

            <a
              href="/booking"
              className="rounded-xl border border-[#cdbfb3] px-6 py-3 font-semibold transition hover:bg-[#f5eee8]"
            >
              Забронировать ещё
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}