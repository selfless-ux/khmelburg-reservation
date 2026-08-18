"use client";

import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: number;
  date: string;
  time: string;
  guests: number;
  status: string;
  comment: string | null;
  client: {
    fullName: string;
    phone: string;
    email: string | null;
  };
  table: {
    number: number;
    seats: number;
    features: string | null;
    zone: {
      name: string;
      description: string | null;
    };
  };
};

function formatDate(dateString: string) {
  const datePart = dateString.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusText(status: string) {
  switch (status) {
    case "created":
      return "Создано";
    case "confirmed":
      return "Подтверждено";
    case "cancelled":
      return "Отменено";
    default:
      return status;
  }
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/bookings");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки");
      }

      setBookings(data);
    } catch (error) {
      console.error(error);

      setError("Не удалось загрузить бронирования");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function changeStatus(
    bookingId: number,
    status: "created" | "confirmed" | "cancelled"
  ) {
    try {
      setUpdatingId(bookingId);
      setError("");

      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка изменения статуса");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Не удалось изменить статус"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredBookings = useMemo(() => {
    if (filter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === filter
    );
  }, [bookings, filter]);

  const total = bookings.length;

  const created = bookings.filter(
    (booking) => booking.status === "created"
  ).length;

  const confirmed = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const cancelled = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-8 text-[#2f241f]">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#9b7358]">
              Хмельбург
            </p>

            <h1 className="text-4xl font-bold">
              Панель администратора
            </h1>

            <p className="mt-2 text-[#74655d]">
              Управление бронированиями ресторана
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            className="rounded-xl bg-[#7b4f35] px-5 py-3 font-semibold text-white hover:bg-[#69432e]"
          >
            ↻ Обновить
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-[#8b7b71]">
              Всего бронирований
            </p>

            <p className="mt-2 text-4xl font-bold">
              {total}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-[#8b7b71]">
              Создано
            </p>

            <p className="mt-2 text-4xl font-bold text-amber-600">
              {created}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-[#8b7b71]">
              Подтверждено
            </p>

            <p className="mt-2 text-4xl font-bold text-green-600">
              {confirmed}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="text-sm text-[#8b7b71]">
              Отменено
            </p>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {cancelled}
            </p>
          </div>

        </section>

        {/* FILTER */}

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-md">

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-xl px-5 py-2.5 font-medium ${
                filter === "all"
                  ? "bg-[#7b4f35] text-white"
                  : "bg-[#f3ede8] text-[#5d4c42]"
              }`}
            >
              Все ({total})
            </button>

            <button
              type="button"
              onClick={() => setFilter("created")}
              className={`rounded-xl px-5 py-2.5 font-medium ${
                filter === "created"
                  ? "bg-amber-500 text-white"
                  : "bg-[#f3ede8] text-[#5d4c42]"
              }`}
            >
              Созданные ({created})
            </button>

            <button
              type="button"
              onClick={() => setFilter("confirmed")}
              className={`rounded-xl px-5 py-2.5 font-medium ${
                filter === "confirmed"
                  ? "bg-green-600 text-white"
                  : "bg-[#f3ede8] text-[#5d4c42]"
              }`}
            >
              Подтверждённые ({confirmed})
            </button>

            <button
              type="button"
              onClick={() => setFilter("cancelled")}
              className={`rounded-xl px-5 py-2.5 font-medium ${
                filter === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-[#f3ede8] text-[#5d4c42]"
              }`}
            >
              Отменённые ({cancelled})
            </button>

          </div>

        </section>

        {/* BOOKINGS */}

        {loading ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-md">
            <p className="text-lg text-[#74655d]">
              Загружаем бронирования...
            </p>
          </section>
        ) : filteredBookings.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-md">
            <div className="text-5xl">📭</div>

            <h2 className="mt-4 text-xl font-semibold">
              Бронирований нет
            </h2>

            <p className="mt-2 text-[#74655d]">
              По выбранному фильтру ничего не найдено.
            </p>
          </section>
        ) : (
          <section className="space-y-5">

            {filteredBookings.map((booking) => (

              <article
                key={booking.id}
                className="rounded-3xl bg-white p-6 shadow-md"
              >

                {/* TOP */}

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                  <div>
                    <p className="text-sm text-[#9b7358]">
                      Бронирование №{booking.id}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Столик №{booking.table.number}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                      booking.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {getStatusText(booking.status)}
                  </span>

                </div>

                {/* INFO */}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Клиент
                    </p>

                    <p className="mt-1 font-semibold">
                      {booking.client.fullName}
                    </p>

                    <p className="text-sm text-[#74655d]">
                      {booking.client.phone}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Дата
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatDate(booking.date)}
                    </p>

                    <p className="text-sm text-[#74655d]">
                      {booking.time}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Гости
                    </p>

                    <p className="mt-1 font-semibold">
                      👥 {booking.guests}
                    </p>

                    <p className="text-sm text-[#74655d]">
                      Вместимость: {booking.table.seats}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Зона
                    </p>

                    <p className="mt-1 font-semibold">
                      {booking.table.zone.name}
                    </p>

                    {booking.table.features && (
                      <p className="text-sm text-[#74655d]">
                        {booking.table.features}
                      </p>
                    )}
                  </div>

                </div>

                {/* COMMENT */}

                {booking.comment && (
                  <div className="mt-4 rounded-2xl border border-[#e5d9d0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Комментарий
                    </p>

                    <p className="mt-1">
                      {booking.comment}
                    </p>
                  </div>
                )}

                {/* ACTIONS */}

                {booking.status !== "cancelled" && (
                  <div className="mt-6 flex flex-col gap-3 border-t border-[#eee5df] pt-5 sm:flex-row">

                    {booking.status !== "confirmed" && (
                      <button
                        type="button"
                        onClick={() =>
                          changeStatus(
                            booking.id,
                            "confirmed"
                          )
                        }
                        disabled={
                          updatingId === booking.id
                        }
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingId === booking.id
                          ? "Сохраняем..."
                          : "✓ Подтвердить"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          booking.id,
                          "cancelled"
                        )
                      }
                      disabled={
                        updatingId === booking.id
                      }
                      className="rounded-xl border-2 border-red-300 px-5 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      ✕ Отменить
                    </button>

                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="mt-6 border-t border-[#eee5df] pt-5">
                    <div className="rounded-xl bg-red-50 px-5 py-3 text-center font-semibold text-red-700">
                      Бронирование отменено
                    </div>
                  </div>
                )}

              </article>

            ))}

          </section>
        )}

        {/* FOOTER */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <a
            href="/"
            className="rounded-xl border border-[#7b4f35] px-6 py-3 text-center font-semibold text-[#7b4f35]"
          >
            На главную
          </a>

          <a
            href="/booking"
            className="rounded-xl bg-[#7b4f35] px-6 py-3 text-center font-semibold text-white"
          >
            Перейти к бронированию
          </a>

        </div>

      </div>
    </main>
  );
}