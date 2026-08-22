"use client";

import { useMemo, useState } from "react";

export default function BookingConfirmPage() {
  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(window.location.search);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

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

  async function confirmBooking() {
    setErrorMessage("");
    setResultMessage("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("Введите имя клиента.");
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage("Введите номер телефона.");
      return;
    }

    const tableIds = isBar
      ? barTableIds.map(Number)
      : tableId
        ? [Number(tableId)]
        : [];

    if (tableIds.length === 0) {
      setErrorMessage("Столик не выбран.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: isBar ? undefined : Number(tableId),
          tableIds: isBar ? tableIds : undefined,
          guests: Number(guests),
          date,
          time,
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Не удалось создать бронирование"
        );
      }

      const bookingIds = Array.isArray(data.bookingIds)
        ? data.bookingIds.join(", ")
        : data.booking?.id;

      setResultMessage(
        `Бронирование успешно сохранено! Номер бронирования: ${bookingIds}`
      );
    } catch (error) {
      console.error("Ошибка бронирования:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при сохранении бронирования."
      );
    } finally {
      setIsLoading(false);
    }
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
            Проверьте параметры бронирования и заполните данные клиента.
          </p>
        </header>

        <section className="rounded-[2rem] border border-[#e2d5cb] bg-white p-6 shadow-xl sm:p-8">

          {/* ВЫБОР */}
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

          {/* ПАРАМЕТРЫ */}
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

          {/* ДАННЫЕ КЛИЕНТА */}
          <div className="mt-6 rounded-2xl bg-[#f8f4ef] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6547]">
              Данные клиента
            </p>

            <div className="mt-5 space-y-4">

              {/* ИМЯ */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#5f5048]"
                >
                  Имя *
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Введите ваше имя"
                  disabled={isLoading || !!resultMessage}
                  className="w-full rounded-xl border border-[#d5c7bc] bg-white px-4 py-3 outline-none transition focus:border-[#9b6749] focus:ring-2 focus:ring-[#9b6749]/20 disabled:opacity-60"
                />
              </div>

              {/* ТЕЛЕФОН */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[#5f5048]"
                >
                  Номер телефона *
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+7 (999) 123-45-67"
                  disabled={isLoading || !!resultMessage}
                  className="w-full rounded-xl border border-[#d5c7bc] bg-white px-4 py-3 outline-none transition focus:border-[#9b6749] focus:ring-2 focus:ring-[#9b6749]/20 disabled:opacity-60"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#5f5048]"
                >
                  Email
                  <span className="ml-2 font-normal text-[#9a8b82]">
                    (необязательно)
                  </span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="example@mail.ru"
                  disabled={isLoading || !!resultMessage}
                  className="w-full rounded-xl border border-[#d5c7bc] bg-white px-4 py-3 outline-none transition focus:border-[#9b6749] focus:ring-2 focus:ring-[#9b6749]/20 disabled:opacity-60"
                />
              </div>

            </div>
          </div>

          {/* БАРНЫЕ МЕСТА */}
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

          {/* УСПЕХ */}
          {resultMessage && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
              <p className="font-bold">
                ✓ Бронирование успешно создано
              </p>

              <p className="mt-2 text-sm">
                {resultMessage}
              </p>
            </div>
          )}

          {/* ОШИБКА */}
          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              <p className="font-bold">
                Ошибка
              </p>

              <p className="mt-1 text-sm">
                {errorMessage}
              </p>
            </div>
          )}

          {/* КНОПКИ */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={goBack}
              disabled={isLoading}
              className="rounded-2xl border-2 border-[#d8c8bd] bg-white px-6 py-4 font-bold text-[#6f5e54] transition hover:bg-[#f8f3ee] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Назад
            </button>

            <button
              type="button"
              onClick={confirmBooking}
              disabled={isLoading || !!resultMessage}
              className="flex-1 rounded-2xl bg-[#8a5639] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#70442e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Сохраняем бронирование..."
                : resultMessage
                  ? "Бронирование сохранено ✓"
                  : "Подтвердить бронирование →"}
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}
