"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState("");

  function handleDateChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    let formatted = digits;

    if (digits.length > 2) {
      formatted = digits.slice(0, 2) + "." + digits.slice(2);
    }

    if (digits.length > 4) {
      formatted =
        digits.slice(0, 2) +
        "." +
        digits.slice(2, 4) +
        "." +
        digits.slice(4);
    }

    setDate(formatted);
    setError("");
  }

  function handleTimeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    let formatted = digits;

    if (digits.length > 2) {
      formatted = digits.slice(0, 2) + ":" + digits.slice(2);
    }

    setTime(formatted);
    setError("");
  }

  function handleSearch() {
    setError("");

    if (!date) {
      setError("Пожалуйста, укажите дату посещения.");
      return;
    }

    if (!time) {
      setError("Пожалуйста, укажите время посещения.");
      return;
    }

    const dateMatch = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

    if (!dateMatch) {
      setError(
        "Введите дату в формате ДД.ММ.ГГГГ, например 16.07.2026."
      );
      return;
    }

    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);

    const selectedDate = new Date(year, month - 1, day);

    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day
    ) {
      setError("Указана некорректная дата.");
      return;
    }

    const timeMatch = time.match(/^(\d{2}):(\d{2})$/);

    if (!timeMatch) {
      setError(
        "Введите время в формате ЧЧ:ММ, например 20:00."
      );
      return;
    }

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      setError("Укажите корректное время.");
      return;
    }

    const selectedDateTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes
    );

    if (selectedDateTime.getTime() < Date.now()) {
      setError("Нельзя выбрать дату и время в прошлом.");
      return;
    }

    const formattedDate =
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const params = new URLSearchParams({
      date: formattedDate,
      time: time,
      guests: guests,
    });

    router.push(`/booking?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#2f241f]">
      {/* Шапка */}
      <header className="border-b border-[#e4d9ce] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              ХМЕЛЬБУРГ
            </h1>

            <p className="text-sm text-[#806f63]">
              Ресторан
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Мои бронирования */}
            <button
              type="button"
              onClick={() => router.push("/booking/my")}
              className="rounded-xl border border-[#cdbfb3] px-5 py-2.5 text-sm font-medium transition hover:bg-[#f5eee8]"
            >
              Мои бронирования
            </button>

            {/* Войти */}
            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="rounded-xl bg-[#7d422b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#683521]"
            >
              Войти
            </button>
          </div>
        </div>
      </header>

      {/* Основной блок */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Текст */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5c3b]">
              Онлайн-бронирование
            </p>

            <h2 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
              Забронируйте столик
              <br />
              в ресторане «Хмельбург»
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-[#6f625a]">
              Выберите удобную дату, время и количество гостей.
              Система покажет подходящие свободные столики,
              чтобы вы могли быстро оформить бронирование.
            </p>
          </div>

          {/* Форма */}
          <div className="rounded-3xl bg-white p-7 shadow-xl shadow-black/5">
            <h3 className="text-2xl font-semibold">
              Найти столик
            </h3>

            <p className="mt-2 text-sm text-[#806f63]">
              Укажите параметры посещения
            </p>

            <div className="mt-7 space-y-5">
              {/* Дата */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium"
                >
                  Дата посещения
                </label>

                <input
                  id="date"
                  type="text"
                  inputMode="numeric"
                  placeholder="ДД.ММ.ГГГГ"
                  value={date}
                  onChange={(event) =>
                    handleDateChange(event.target.value)
                  }
                  maxLength={10}
                  className="w-full rounded-xl border border-[#d9cdc3] bg-[#fcfaf8] px-4 py-3 outline-none transition focus:border-[#9a5c3b]"
                />

                <p className="mt-2 text-xs text-[#806f63]">
                  Например: 16.07.2026
                </p>
              </div>

              {/* Время */}
              <div>
                <label
                  htmlFor="time"
                  className="mb-2 block text-sm font-medium"
                >
                  Время
                </label>

                <input
                  id="time"
                  type="text"
                  inputMode="numeric"
                  placeholder="ЧЧ:ММ"
                  value={time}
                  onChange={(event) =>
                    handleTimeChange(event.target.value)
                  }
                  maxLength={5}
                  className="w-full rounded-xl border border-[#d9cdc3] bg-[#fcfaf8] px-4 py-3 outline-none transition focus:border-[#9a5c3b]"
                />

                <p className="mt-2 text-xs text-[#806f63]">
                  Например: 20:00
                </p>
              </div>

              {/* Количество гостей */}
              <div>
                <label
                  htmlFor="guests"
                  className="mb-2 block text-sm font-medium"
                >
                  Количество гостей
                </label>

                <select
                  id="guests"
                  value={guests}
                  onChange={(event) =>
                    setGuests(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#d9cdc3] bg-[#fcfaf8] px-4 py-3 outline-none transition focus:border-[#9a5c3b]"
                >
                  <option value="1">1 гость</option>
                  <option value="2">2 гостя</option>
                  <option value="3">3 гостя</option>
                  <option value="4">4 гостя</option>
                  <option value="5">5 гостей</option>
                  <option value="6">6 гостей</option>
                  <option value="7">7 гостей</option>
                  <option value="8">8 гостей</option>
                  <option value="9">9 гостей</option>
                  <option value="10">10 гостей</option>
                </select>
              </div>

              {/* Ошибка */}
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Кнопка */}
              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-xl bg-[#7d422b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#683521]"
              >
                Найти свободный столик
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Информационный блок */}
      <section className="border-t border-[#e4d9ce] bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
          <div>
            <div className="mb-3 text-2xl">
              🍽️
            </div>

            <h3 className="font-semibold">
              Выбор столика
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#806f63]">
              Выберите подходящий столик с учетом его
              вместимости и расположения.
            </p>
          </div>

          <div>
            <div className="mb-3 text-2xl">
              📅
            </div>

            <h3 className="font-semibold">
              Удобное бронирование
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#806f63]">
              Забронируйте столик на удобную дату и время
              без обращения к администратору.
            </p>
          </div>

          <div>
            <div className="mb-3 text-2xl">
              🔒
            </div>

            <h3 className="font-semibold">
              Безопасность данных
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#806f63]">
              Данные пользователей и бронирований
              хранятся в защищенной информационной системе.
            </p>
          </div>
        </div>
      </section>

      {/* Подвал */}
      <footer className="border-t border-[#e4d9ce] bg-[#f7f3ee]">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-[#806f63]">
          © 2026 Ресторан «Хмельбург». Онлайн-бронирование столиков.
        </div>
      </footer>
    </main>
  );
}