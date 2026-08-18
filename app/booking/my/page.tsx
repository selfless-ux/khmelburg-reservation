"use client";

import { FormEvent, useState } from "react";

type Booking = {
  id: number;
  date: string;
  time: string;
  guests: number;
  status: string;
  comment: string | null;
  table: {
    number: number;
    seats: number;
    features: string | null;
    zone: {
      name: string;
      description: string | null;
    };
  };
  client: {
    fullName: string;
    phone: string;
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

export default function MyBookingsPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phone.trim()) {
      setError("Введите номер телефона");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/bookings?phone=${encodeURIComponent(phone.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки");
      }

      setBookings(data);
      setSearched(true);
    } catch (error) {
      console.error(error);
      setError("Не удалось загрузить бронирования");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId: number) {
    const confirmed = window.confirm(
      "Вы действительно хотите отменить это бронирование?"
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(bookingId);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка отмены");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Не удалось отменить бронирование"
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-10 text-[#2f241f]">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#9b7358]">
            Хмельбург
          </p>

          <h1 className="text-4xl font-bold">
            Мои бронирования
          </h1>

          <p className="mt-3 text-[#74655d]">
            Введите номер телефона, указанный при бронировании.
          </p>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-lg">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="flex-1">
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Номер телефона
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Например, 89991234567"
                className="w-full rounded-xl border border-[#ddd2ca] px-4 py-3 outline-none focus:border-[#9b7358]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#7b4f35] px-7 py-3 font-semibold text-white"
            >
              {loading ? "Поиск..." : "Найти бронирования"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
              {error}
            </p>
          )}
        </section>

        {searched && bookings.length === 0 && (
          <section className="mt-6 rounded-3xl bg-white p-8 text-center shadow-lg">
            <div className="text-5xl">📭</div>

            <h2 className="mt-4 text-xl font-semibold">
              Бронирования не найдены
            </h2>
          </section>
        )}

        {bookings.length > 0 && (
          <section className="mt-6 space-y-5">

            <h2 className="text-2xl font-bold">
              Найденные бронирования
            </h2>

            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-3xl bg-white p-6 shadow-lg"
              >

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>
                    <p className="text-sm text-[#9b7358]">
                      Бронирование №{booking.id}
                    </p>

                    <h3 className="text-2xl font-bold">
                      Столик №{booking.table.number}
                    </h3>
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

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Дата
                    </p>

                    <p className="font-semibold">
                      📅 {formatDate(booking.date)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Время
                    </p>

                    <p className="font-semibold">
                      🕐 {booking.time}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Гости
                    </p>

                    <p className="font-semibold">
                      👥 {booking.guests}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f4f0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Зона
                    </p>

                    <p className="font-semibold">
                      📍 {booking.table.zone.name}
                    </p>
                  </div>

                </div>

                {booking.table.features && (
                  <div className="mt-4 rounded-2xl border border-[#e5d9d0] p-4">
                    <p className="text-sm text-[#8b7b71]">
                      Особенности столика
                    </p>

                    <p>
                      {booking.table.features}
                    </p>
                  </div>
                )}

                <div className="mt-5 border-t border-[#eee5df] pt-4">
                  <p className="text-sm text-[#8b7b71]">
                    Клиент
                  </p>

                  <p className="font-medium">
                    {booking.client.fullName}
                  </p>

                  <p className="text-sm text-[#74655d]">
                    {booking.client.phone}
                  </p>
                </div>

                {/* КНОПКА ОТМЕНЫ */}
                {booking.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="mt-6 w-full rounded-xl border-2 border-red-300 bg-white px-5 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === booking.id
                      ? "Отменяем..."
                      : "Отменить бронирование"}
                  </button>
                )}

                {booking.status === "cancelled" && (
                  <div className="mt-6 rounded-xl bg-red-50 px-5 py-3 text-center font-semibold text-red-700">
                    Бронирование отменено
                  </div>
                )}

              </article>
            ))}
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <a
            href="/booking"
            className="rounded-xl border border-[#7b4f35] px-6 py-3 text-center font-semibold text-[#7b4f35]"
          >
            Вернуться к бронированию
          </a>

          <a
            href="/"
            className="rounded-xl bg-[#7b4f35] px-6 py-3 text-center font-semibold text-white"
          >
            На главную
          </a>

        </div>

      </div>
    </main>
  );
}