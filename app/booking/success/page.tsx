"use client";

import { useEffect, useState } from "react";

export default function BookingSuccessPage() {
  const [table, setTable] = useState("");
  const [tables, setTables] = useState("");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setTable(params.get("table") || "");
    setTables(params.get("tables") || "");
    setGuests(params.get("guests") || "");
    setDate(params.get("date") || "");
    setTime(params.get("time") || "");
    setName(params.get("name") || "");
    setPhone(params.get("phone") || "");
    setBookingId(params.get("bookingId") || "");
  }, []);

  function formatDate(value: string) {
    if (!value) {
      return "Не указана";
    }

    const dateObject = new Date(`${value}T00:00:00`);

    if (Number.isNaN(dateObject.getTime())) {
      return value;
    }

    return dateObject.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const isBar = !!tables;

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#2f241f]">
      {/* HEADER */}
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

      {/* SUCCESS SECTION */}
      <section className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6 py-14">
        <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl shadow-black/5 sm:p-12">

          {/* SUCCESS ICON */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f0e5dc] text-4xl text-[#7d422b]">
            ✓
          </div>

          {/* STATUS */}
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5c3b]">
            Готово
          </p>

          {/* TITLE */}
          <h2 className="mt-3 text-4xl font-bold">
            Бронирование создано!
          </h2>

          {/* DESCRIPTION */}
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#6f625a]">
            Ваша заявка успешно оформлена.
            Сохраните информацию о бронировании
            или обратитесь к администратору ресторана
            при необходимости.
          </p>

          {/* BOOKING NUMBER */}
          {bookingId && (
            <div className="mx-auto mt-7 max-w-md rounded-2xl border border-[#e4d9ce] bg-[#fffaf6] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a5c3b]">
                Номер бронирования
              </p>

              <p className="mt-2 text-3xl font-bold text-[#7d422b]">
                #{bookingId}
              </p>
            </div>
          )}

          {/* BOOKING INFORMATION */}
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[#f7f3ee] p-6 text-left">

            {/* TABLE */}
            <div className="flex justify-between border-b border-[#e4d9ce] pb-4">
              <span className="text-[#806f63]">
                {isBar ? "Места у бара" : "Столик"}
              </span>

              <span className="font-semibold">
                {isBar
                  ? `№ ${tables.split(",").join(", ")}`
                  : table
                    ? `№${table}`
                    : "Не указан"}
              </span>
            </div>

            {/* DATE */}
            <div className="flex justify-between border-b border-[#e4d9ce] py-4">
              <span className="text-[#806f63]">
                Дата
              </span>

              <span className="font-semibold">
                {formatDate(date)}
              </span>
            </div>

            {/* TIME */}
            <div className="flex justify-between border-b border-[#e4d9ce] py-4">
              <span className="text-[#806f63]">
                Время
              </span>

              <span className="font-semibold">
                {time || "Не указано"}
              </span>
            </div>

            {/* GUESTS */}
            <div className="flex justify-between border-b border-[#e4d9ce] py-4">
              <span className="text-[#806f63]">
                Гости
              </span>

              <span className="font-semibold">
                {guests || "Не указано"}
              </span>
            </div>

            {/* NAME */}
            {name && (
              <div className="flex justify-between border-b border-[#e4d9ce] py-4">
                <span className="text-[#806f63]">
                  Имя
                </span>

                <span className="font-semibold">
                  {name}
                </span>
              </div>
            )}

            {/* PHONE */}
            {phone && (
              <div className="flex justify-between pt-4">
                <span className="text-[#806f63]">
                  Телефон
                </span>

                <span className="font-semibold">
                  {phone}
                </span>
              </div>
            )}
          </div>

          {/* SUCCESS MESSAGE */}
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-bold">
              ✓ Бронирование успешно сохранено
            </p>

            <p className="mt-1">
              Данные переданы в систему ресторана.
            </p>
          </div>

          {/* ACTION BUTTONS */}
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

            <a
              href="/booking/my"
              className="rounded-xl border border-[#cdbfb3] px-6 py-3 font-semibold transition hover:bg-[#f5eee8]"
            >
              Мои бронирования
            </a>

          </div>
        </div>
      </section>
    </main>
  );
}