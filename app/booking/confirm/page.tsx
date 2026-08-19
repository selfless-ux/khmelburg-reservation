"use client";

import { useMemo } from "react";

export default function BookingConfirmPage() {
  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(window.location.search);
  }, []);

  if (!params) {
    return null;
  }

  const tableId = params.get("table");
  const tablesParam = params.get("tables");
  const guests = params.get("guests") || "2";
  const date = params.get("date") || "";
  const time = params.get("time") || "";
  const type = params.get("type") || "table";

  const barTableIds = tablesParam
    ? tablesParam.split(",").filter(Boolean)
    : [];

  const isBar = type === "bar";

  function formatDate(value: string) {
    if (!value) {
      return "Не выбрана";
    }

    const dateObject = new Date(`${value}T00:00:00`);

    if (Number.isNaN(dateObject.getTime())) {
      return value;
    }

    return dateObject.toLocaleDateString("ru-RU");
  }

  function goBack() {
    window.history.back();
  }

  function confirmBooking() {
    alert(
      "Бронирование подтверждено! На следующем этапе подключим сохранение бронирования в базу данных."
    );
  }

  return (
    <main className="min-h-screen bg-[#f4eee7] px-4 py-8 text-[#30251f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <header className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#9b6749]">
            ХМЕЛЬБУРГ
          </p>

          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Подтверждение бронирования
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[#766960]">
            Проверьте параметры бронирования перед подтверждением.
          </p>
        </header>

        {/* MAIN CARD */}
        <section className="rounded-[2rem] border border-[#e2d5cb] bg-white p-6 shadow-xl sm:p-8">

          {/* SELECTED PLACE */}
          <div className="mb-6 rounded-2xl bg-[#f8f4ef] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6547]">
              Ваш выбор
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {isBar
                ? "Места у бара"
                : tableId
                  ? `Столик №${tableId}`
                  : "Столик не выбран"}
            </h2>

            {isBar && (
              <p className="mt-2 text-sm text-[#76665d]">
                Выбрано мест:{" "}
                <strong>{barTableIds.length}</strong>
              </p>
            )}
          </div>

          {/* BOOKING PARAMETERS */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-[#f8f4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#95857b]">
                Дата
              </p>

              <p className="mt-1 text-lg font-bold">
                {formatDate(date)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#95857b]">
                Время
              </p>

              <p className="mt-1 text-lg font-bold">
                {time || "Не выбрано"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#95857b]">
                Гости
              </p>

              <p className="mt-1 text-lg font-bold">
                {guests}
              </p>
            </div>

          </div>

          {/* BAR SEATS */}
          {isBar && barTableIds.length > 0 && (
            <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-5">

              <p className="text-sm font-bold text-purple-800">
                Выбранные места у бара
              </p>

              <p className="mt-2 text-purple-700">
                № {barTableIds.join(", ")}
              </p>

            </div>
          )}

          {/* SUMMARY */}
          <div className="mt-6 rounded-2xl border border-[#e4d8cf] bg-[#fffaf6] p-5">

            <p className="text-sm font-semibold text-[#8b5638]">
              Детали бронирования
            </p>

            <div className="mt-3 space-y-2 text-sm text-[#6f625a]">

              <p>
                👥 Количество гостей:{" "}
                <strong>{guests}</strong>
              </p>

              <p>
                📅 Дата:{" "}
                <strong>{formatDate(date)}</strong>
              </p>

              <p>
                🕐 Время:{" "}
                <strong>{time || "Не выбрано"}</strong>
              </p>

              <p>
                {isBar ? "🍸" : "🪑"} Место:{" "}
                <strong>
                  {isBar
                    ? `места у бара (${barTableIds.length})`
                    : tableId
                      ? `столик №${tableId}`
                      : "не выбрано"}
                </strong>
              </p>

            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={goBack}
              className="rounded-2xl border-2 border-[#d8c8bd] bg-white px-6 py-4 font-bold text-[#6f5e54] transition hover:bg-[#f8f3ee]"
            >
              ← Назад
            </button>

            <button
              type="button"
              onClick={confirmBooking}
              className="flex-1 rounded-2xl bg-[#8a5639] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#70442e]"
            >
              Подтвердить бронирование →
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}