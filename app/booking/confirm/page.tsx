"use client";

import { useEffect, useMemo, useState } from "react";

type Table = {
  id: number;
  number: number;
  seats: number;
  status: string;
  features: string | null;
  zone: {
    id: number;
    name: string;
    description: string | null;
  };
};

const filters = [
  {
    value: "all",
    label: "Все",
    icon: "✦",
  },
  {
    value: "У окна",
    label: "У окна",
    icon: "🪟",
  },
  {
    value: "У бара",
    label: "У бара",
    icon: "🍸",
  },
  {
    value: "Тихая зона",
    label: "Тихая зона",
    icon: "🤫",
  },
  {
    value: "У выхода",
    label: "У выхода",
    icon: "🚪",
  },
];

export default function BookingPage() {
  const [tables, setTables] = useState<Table[]>([]);

  // Обычный столик
  const [selectedTable, setSelectedTable] =
    useState<number | null>(null);

  // Несколько мест у бара
  const [selectedBarSeats, setSelectedBarSeats] =
    useState<number[]>([]);

  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // ЗАГРУЗКА ДАННЫХ
  // ==================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const dateParam = params.get("date");
    const timeParam = params.get("time");
    const guestsParam = params.get("guests");

    if (dateParam) {
      setDate(dateParam);
    }

    if (timeParam) {
      setTime(timeParam);
    }

    if (guestsParam) {
      const parsedGuests = Number(guestsParam);

      if (
        Number.isFinite(parsedGuests) &&
        parsedGuests >= 1 &&
        parsedGuests <= 20
      ) {
        setGuests(parsedGuests);
      }
    }

    async function loadTables() {
      try {
        setLoading(true);

        const response = await fetch("/api/tables");

        if (!response.ok) {
          throw new Error(
            "Ошибка загрузки столиков"
          );
        }

        const data: Table[] =
          await response.json();

        setTables(data);
      } catch (error) {
        console.error(error);

        setError(
          "Не удалось загрузить столики"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTables();
  }, []);

  // ==================================================
  // ФОРМАТ ДАТЫ
  // ==================================================

  function formatDate(value: string) {
    if (!value) {
      return "Не выбрана";
    }

    const dateObject = new Date(
      `${value}T00:00:00`
    );

    if (Number.isNaN(dateObject.getTime())) {
      return value;
    }

    return dateObject.toLocaleDateString(
      "ru-RU"
    );
  }

  // ==================================================
  // ПРОВЕРКА: ЯВЛЯЕТСЯ ЛИ МЕСТО БАРНЫМ
  // ==================================================

  function isBarTable(table: Table) {
    return table.zone.name === "Барная зона";
  }

  // ==================================================
  // ПОДХОДЯЩИЕ МЕСТА
  // ==================================================

  const suitableTables = useMemo(() => {
    return tables.filter((table) => {
      if (table.status !== "available") {
        return false;
      }

      if (isBarTable(table)) {
        // Для бара каждое место = один гость.
        // Показываем барные места,
        // если гостей хотя бы 1.
        if (guests < 1) {
          return false;
        }
      } else {
        // Обычный столик должен вмещать
        // всю компанию.
        if (table.seats < guests) {
          return false;
        }
      }

      if (activeFilter === "all") {
        return true;
      }

      if (activeFilter === "Тихая зона") {
        return (
          table.zone.name ===
          "Тихая зона"
        );
      }

      if (activeFilter === "У бара") {
        return isBarTable(table);
      }

      return (
        table.features?.includes(
          activeFilter
        ) ?? false
      );
    });
  }, [
    tables,
    guests,
    activeFilter,
  ]);

  // ==================================================
  // ПРОВЕРКА ПОДХОДЯЩЕГО МЕСТА
  // ==================================================

  function isTableSuitable(
    table: Table
  ) {
    return suitableTables.some(
      (item) => item.id === table.id
    );
  }

  // ==================================================
  // КОЛИЧЕСТВО ГОСТЕЙ
  // ==================================================

  function handleGuestsChange(
    value: number
  ) {
    const newGuests = Math.min(
      20,
      Math.max(1, value)
    );

    setGuests(newGuests);

    // Если выбран обычный столик,
    // проверяем, подходит ли он теперь.
    if (selectedTable) {
      const selected =
        tables.find(
          (table) =>
            table.id === selectedTable
        );

      if (
        selected &&
        selected.seats < newGuests
      ) {
        setSelectedTable(null);
      }
    }

    // Для бара количество выбранных мест
    // не может превышать количество гостей.
    if (
      selectedBarSeats.length >
      newGuests
    ) {
      setSelectedBarSeats(
        selectedBarSeats.slice(
          0,
          newGuests
        )
      );
    }
  }

  // ==================================================
  // ВЫБОР ОБЫЧНОГО СТОЛИКА
  // ==================================================

  function selectNormalTable(
    table: Table
  ) {
    if (!isTableSuitable(table)) {
      return;
    }

    if (isBarTable(table)) {
      return;
    }

    // Нельзя одновременно выбирать
    // обычный столик и барные места.
    setSelectedBarSeats([]);

    setSelectedTable(table.id);
  }

  // ==================================================
  // ВЫБОР БАРНОГО МЕСТА
  // ==================================================

  function toggleBarSeat(
    table: Table
  ) {
    if (!isTableSuitable(table)) {
      return;
    }

    if (!isBarTable(table)) {
      return;
    }

    // Нельзя одновременно выбирать
    // обычный столик и барные места.
    setSelectedTable(null);

    const alreadySelected =
      selectedBarSeats.includes(
        table.id
      );

    if (alreadySelected) {
      // Убираем место
      setSelectedBarSeats(
        selectedBarSeats.filter(
          (id) => id !== table.id
        )
      );

      return;
    }

    // Нельзя выбрать больше барных мест,
    // чем гостей.
    if (
      selectedBarSeats.length >=
      guests
    ) {
      return;
    }

    setSelectedBarSeats([
      ...selectedBarSeats,
      table.id,
    ]);
  }

  // ==================================================
  // ПРОДОЛЖИТЬ БРОНИРОВАНИЕ
  // ==================================================

  function continueBooking() {
    // --------------------------------------------------
    // ВАРИАНТ 1 — ОБЫЧНЫЙ СТОЛИК
    // --------------------------------------------------

    if (selectedTable) {
      const table = tables.find(
        (item) =>
          item.id === selectedTable
      );

      if (!table) {
        return;
      }

      const params =
        new URLSearchParams({
          table: String(table.id),
          guests: String(guests),
          date,
          time,
          type: "table",
        });

      window.location.href =
        `/booking/confirm?${params.toString()}`;

      return;
    }

    // --------------------------------------------------
    // ВАРИАНТ 2 — БАР
    // --------------------------------------------------

    if (
      selectedBarSeats.length > 0
    ) {
      if (
        selectedBarSeats.length !==
        guests
      ) {
        alert(
          `Для ${guests} гостей необходимо выбрать ${guests} места у бара.`
        );

        return;
      }

      const params =
        new URLSearchParams({
          tables:
            selectedBarSeats.join(","),
          guests: String(guests),
          date,
          time,
          type: "bar",
        });

      window.location.href =
        `/booking/confirm?${params.toString()}`;

      return;
    }

    alert(
      "Сначала выберите столик или места у бара."
    );
  }

  // ==================================================
  // ИЗМЕНИТЬ ПАРАМЕТРЫ
  // ==================================================

  function changeSearchParameters() {
    const params =
      new URLSearchParams({
        date,
        time,
        guests: String(guests),
      });

    window.location.href =
      `/?${params.toString()}`;
  }

  // ==================================================
  // ЧТО ВЫБРАНО
  // ==================================================

  const hasNormalTable =
    selectedTable !== null;

  const hasBarSeats =
    selectedBarSeats.length > 0;

  const hasSelection =
    hasNormalTable || hasBarSeats;

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4eee7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🍽️
          </div>

          <p className="text-lg text-[#76665c]">
            Подготавливаем зал...
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <main className="min-h-screen bg-[#f4eee7] flex items-center justify-center px-6">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mb-5 text-5xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-[#30251f]">
            Ошибка
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-[#8b5638] px-6 py-3 font-semibold text-white"
          >
            Повторить
          </button>
        </div>
      </main>
    );
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <main className="min-h-screen bg-[#f4eee7] px-4 py-8 text-[#30251f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#9b6749]">
            ХМЕЛЬБУРГ
          </p>

          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Выбор столика
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[#766960]">
            Выберите подходящее место
            на интерактивной схеме ресторана
          </p>
        </header>

        {/* PARAMETERS */}

        <section className="mb-6 rounded-[2rem] border border-[#e2d5cb] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">

            <InfoBox
              title="Дата"
              value={formatDate(date)}
            />

            <InfoBox
              title="Время"
              value={
                time || "Не выбрано"
              }
            />

            <InfoBox
              title="Гости"
              value={String(guests)}
            />

          </div>

          <button
            type="button"
            onClick={
              changeSearchParameters
            }
            className="mt-5 text-sm font-semibold text-[#8b5638] underline underline-offset-4"
          >
            ← Изменить параметры
          </button>
        </section>

        {/* GUESTS */}

        <section className="mb-6 rounded-[2rem] border border-[#e2d5cb] bg-white p-6 shadow-sm">
          <div className="mx-auto max-w-sm text-center">

            <h2 className="text-xl font-bold">
              Сколько будет гостей?
            </h2>

            <div className="mt-5 flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  handleGuestsChange(
                    guests - 1
                  )
                }
                className="h-12 w-12 rounded-xl bg-[#eee6df] text-2xl font-bold transition hover:bg-[#e2d8cf]"
              >
                −
              </button>

              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(event) =>
                  handleGuestsChange(
                    Number(
                      event.target.value
                    ) || 1
                  )
                }
                className="h-12 flex-1 rounded-xl border border-[#d5c7bc] text-center text-xl font-bold outline-none focus:border-[#9b6749]"
              />

              <button
                type="button"
                onClick={() =>
                  handleGuestsChange(
                    guests + 1
                  )
                }
                className="h-12 w-12 rounded-xl bg-[#eee6df] text-2xl font-bold transition hover:bg-[#e2d8cf]"
              >
                +
              </button>

            </div>

            <p className="mt-3 text-sm text-[#81736a]">
              Для обычного столика требуется
              вместимость на всю компанию.
              Для бара можно выбрать несколько
              отдельных мест.
            </p>
          </div>
        </section>

        {/* FILTERS */}

        <section className="mb-8 rounded-[2rem] border border-[#e2d5cb] bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold">
            Предпочтения
          </h2>

          <div className="flex flex-wrap gap-3">

            {filters.map((filter) => {
              const active =
                activeFilter ===
                filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(
                      filter.value
                    );

                    setSelectedTable(
                      null
                    );

                    setSelectedBarSeats(
                      []
                    );
                  }}
                  className={`rounded-xl border-2 px-4 py-3 font-semibold transition ${
                    active
                      ? "border-[#a96949] bg-[#fbefe7] text-[#8b5638]"
                      : "border-[#e2d7ce] bg-white text-[#665850] hover:border-[#c89b80]"
                  }`}
                >
                  <span className="mr-2">
                    {filter.icon}
                  </span>

                  {filter.label}
                </button>
              );
            })}

          </div>
        </section>

        {/* FLOOR PLAN */}

        <section className="mb-8 overflow-hidden rounded-[2.5rem] border border-[#ded0c5] bg-white shadow-xl">

          <div className="border-b border-[#e5dad2] px-5 py-6 text-center sm:px-8">

            <h2 className="text-2xl font-bold sm:text-3xl">
              Схема зала
            </h2>

            <p className="mt-2 text-sm text-[#81736c]">
              Для бара можно выбрать несколько
              мест одновременно
            </p>

          </div>

          <div className="p-3 sm:p-6 lg:p-8">

            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border-[8px] border-[#bca99c] bg-[#e9e0d8] p-4 shadow-inner sm:p-8">

              {/* WINDOWS */}

              <div className="mb-8">

                <div className="mb-3 flex justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                  <span>🪟</span>
                  Панорамные окна
                  <span>🪟</span>
                </div>

                <div className="h-4 rounded-full border border-sky-300 bg-gradient-to-r from-sky-100 via-sky-300 to-sky-100 shadow-inner" />

              </div>

              {/* TOP AREA */}

              <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr_1.2fr]">

                {/* WINDOW */}

                <ZoneBlock
                  title="У окна"
                  subtitle="Светлая зона"
                  color="blue"
                  icon="🪟"
                >

                  <div className="grid grid-cols-2 gap-4">

                    {tables
                      .filter(
                        (table) =>
                          table.zone.name ===
                          "Зона у окна"
                      )
                      .map((table) => (
                        <TableVisual
                          key={table.id}
                          table={table}
                          suitable={isTableSuitable(
                            table
                          )}
                          selected={
                            selectedTable ===
                            table.id
                          }
                          onClick={() =>
                            selectNormalTable(
                              table
                            )
                          }
                        />
                      ))}

                  </div>

                </ZoneBlock>

                {/* MAIN HALL */}

                <ZoneBlock
                  title="Основной зал"
                  subtitle="Центральная часть ресторана"
                  color="brown"
                  icon="🍽️"
                >

                  <div className="grid grid-cols-2 gap-4">

                    {tables
                      .filter(
                        (table) =>
                          table.zone.name ===
                          "Основной зал"
                      )
                      .map((table) => (
                        <TableVisual
                          key={table.id}
                          table={table}
                          suitable={isTableSuitable(
                            table
                          )}
                          selected={
                            selectedTable ===
                            table.id
                          }
                          onClick={() =>
                            selectNormalTable(
                              table
                            )
                          }
                        />
                      ))}

                  </div>

                </ZoneBlock>

                {/* EXTRA */}

                <div className="flex flex-col justify-between gap-5">

                  <div className="rounded-3xl border border-[#d8c8bd] bg-[#f7f1eb] p-5 text-center">
                    <div className="text-3xl">
                      🍷
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#765544]">
                      Зона ресторана
                    </p>

                    <p className="mt-1 text-xs text-[#918077]">
                      Свободное пространство
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#d8c8bd] bg-[#f7f1eb] p-5 text-center">
                    <div className="text-3xl">
                      🌿
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#765544]">
                      Декоративная зона
                    </p>

                    <p className="mt-1 text-xs text-[#918077]">
                      Интерьер ресторана
                    </p>
                  </div>

                </div>
              </div>

              {/* WALKWAY */}

              <div className="my-8 flex items-center gap-3">

                <div className="h-px flex-1 bg-[#cbbab0]" />

                <span className="rounded-full bg-[#ded3ca] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8d7d72]">
                  проход
                </span>

                <div className="h-px flex-1 bg-[#cbbab0]" />

              </div>

              {/* BOTTOM */}

              <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">

                {/* QUIET */}

                <ZoneBlock
                  title="Тихая зона"
                  subtitle="Спокойная атмосфера"
                  color="green"
                  icon="🤫"
                >

                  <div className="grid grid-cols-2 gap-4">

                    {tables
                      .filter(
                        (table) =>
                          table.zone.name ===
                          "Тихая зона"
                      )
                      .map((table) => (
                        <TableVisual
                          key={table.id}
                          table={table}
                          suitable={isTableSuitable(
                            table
                          )}
                          selected={
                            selectedTable ===
                            table.id
                          }
                          onClick={() =>
                            selectNormalTable(
                              table
                            )
                          }
                        />
                      ))}

                  </div>

                  {tables.filter(
                    (table) =>
                      table.zone.name ===
                      "Тихая зона"
                  ).length === 0 && (
                    <EmptyZone />
                  )}

                </ZoneBlock>

                {/* BAR */}

                <div className="rounded-[2rem] border-2 border-purple-200 bg-[#f4effa] p-5">

                  <div className="mb-5 text-center">

                    <span className="inline-flex rounded-full bg-purple-100 px-5 py-2 text-sm font-bold text-purple-700">
                      🍸 БАР
                    </span>

                    <p className="mt-2 text-xs text-purple-600">
                      Можно выбрать несколько мест
                    </p>

                  </div>

                  {/* BAR COUNTER */}

                  <div className="mb-6 rounded-2xl border-4 border-purple-300 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 py-5 text-center font-bold tracking-wide text-purple-900 shadow-inner">
                    БАРНАЯ СТОЙКА
                  </div>

                  {/* BAR SEATS */}

                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">

                    {tables
                      .filter(
                        (table) =>
                          table.zone.name ===
                          "Барная зона"
                      )
                      .map((table) => (
                        <BarSeat
                          key={table.id}
                          table={table}
                          suitable={isTableSuitable(
                            table
                          )}
                          selected={selectedBarSeats.includes(
                            table.id
                          )}
                          onClick={() =>
                            toggleBarSeat(
                              table
                            )
                          }
                        />
                      ))}

                  </div>

                  {tables.filter(
                    (table) =>
                      table.zone.name ===
                      "Барная зона"
                  ).length === 0 && (
                    <EmptyZone />
                  )}

                  <div className="mt-5 rounded-2xl bg-purple-100 p-4 text-center">

                    <p className="text-sm font-semibold text-purple-800">
                      Выбрано мест:{" "}
                      <strong>
                        {selectedBarSeats.length}
                      </strong>{" "}
                      из{" "}
                      <strong>
                        {guests}
                      </strong>
                    </p>

                    <p className="mt-1 text-xs text-purple-600">
                      Каждое место у бара рассчитано
                      на одного гостя
                    </p>

                  </div>

                </div>
              </div>

              {/* EXIT */}

              <div className="mt-8 flex justify-between">

                <div className="rounded-2xl border-2 border-[#cfc0b5] bg-[#f6f0eb] px-5 py-3 text-xs font-semibold text-[#89776c]">
                  ← Служебная зона
                </div>

                <div className="rounded-2xl border-4 border-red-300 bg-red-100 px-7 py-4 font-bold text-red-700 shadow-sm">
                  🚪 ВЫХОД
                </div>

              </div>

            </div>
          </div>

          {/* LEGEND */}

          <div className="border-t border-[#e5dad2] px-5 py-5">

            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#665850]">

              <Legend
                className="bg-white border-[#cfc3ba]"
                text="Свободно"
              />

              <Legend
                className="bg-[#f6d9a8] border-[#c88732]"
                text="Выбрано"
              />

              <Legend
                className="bg-[#ddd8d4] border-[#b9b0aa]"
                text="Не подходит"
              />

            </div>

          </div>

        </section>

        {/* RESULTS */}

        <section className="mb-6">

          <h2 className="text-2xl font-bold">
            Подходящие места
          </h2>

          <p className="mt-1 text-[#81736b]">
            Найдено:{" "}
            <strong>
              {suitableTables.length}
            </strong>
          </p>

        </section>

        {suitableTables.length === 0 ? (

          <div className="rounded-[2rem] border border-[#e1d6ce] bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              🪑
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Подходящих мест нет
            </h2>

            <p className="mt-2 text-[#7e7169]">
              Попробуйте изменить количество
              гостей или предпочтение.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {suitableTables.map(
              (table) => {

                const isBar =
                  isBarTable(table);

                const selected =
                  isBar
                    ? selectedBarSeats.includes(
                        table.id
                      )
                    : selectedTable ===
                      table.id;

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() =>
                      isBar
                        ? toggleBarSeat(
                            table
                          )
                        : selectNormalTable(
                            table
                          )
                    }
                    className={`rounded-[2rem] border-2 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                      selected
                        ? "border-[#bd793e] bg-[#fff6ec]"
                        : "border-[#e2d8d0]"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-[#9b877b]">
                          {
                            table.zone
                              .name
                          }
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {isBar
                            ? `Место у бара №${table.number}`
                            : `Столик №${table.number}`}
                        </h3>

                      </div>

                      <div className="text-3xl">
                        {isBar
                          ? "🍸"
                          : "🪑"}
                      </div>

                    </div>

                    <div className="mt-4 space-y-1 text-sm text-[#6f625a]">

                      <p>
                        👥{" "}
                        {table.seats ===
                        1
                          ? "1 место"
                          : `${table.seats} мест`}
                      </p>

                      {table.features && (
                        <p>
                          ⭐{" "}
                          {
                            table.features
                          }
                        </p>
                      )}

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

        {/* SELECTED */}

        {hasSelection && (

          <section className="sticky bottom-4 z-30 mt-8 rounded-[2rem] border border-[#d8c6b8] bg-white p-5 shadow-2xl sm:p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6547]">
                  Выбрано
                </p>

                {selectedTable && (
                  <>
                    <h2 className="mt-1 text-2xl font-bold">
                      {(() => {
                        const table =
                          tables.find(
                            (item) =>
                              item.id ===
                              selectedTable
                          );

                        return table
                          ? `Столик №${table.number}`
                          : "Столик";
                      })()}
                    </h2>
                  </>
                )}

                {selectedBarSeats.length >
                  0 && (
                  <>
                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedBarSeats.length ===
                      1
                        ? "1 место у бара"
                        : `${selectedBarSeats.length} места у бара`}
                    </h2>

                    <p className="mt-1 text-sm text-[#76665d]">
                      Места №{" "}
                      {selectedBarSeats
                        .map((id) => {
                          const table =
                            tables.find(
                              (item) =>
                                item.id ===
                                id
                            );

                          return table
                            ?.number;
                        })
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </>
                )}

                <p className="mt-1 text-[#70625a]">
                  {guests} гостей ·{" "}
                  {formatDate(date)}{" "}
                  {time &&
                    `· ${time}`}
                </p>

                {selectedBarSeats.length >
                  0 &&
                  selectedBarSeats.length !==
                    guests && (
                    <p className="mt-2 text-sm font-semibold text-red-600">
                      Выберите ещё{" "}
                      {guests -
                        selectedBarSeats.length}{" "}
                      место
                      {guests -
                        selectedBarSeats.length ===
                      1
                        ? ""
                        : "а"}{" "}
                      у бара
                    </p>
                  )}

              </div>

              <button
                type="button"
                onClick={
                  continueBooking
                }
                disabled={
                  selectedBarSeats.length >
                    0 &&
                  selectedBarSeats.length !==
                    guests
                }
                className={`rounded-2xl px-7 py-4 font-bold text-white shadow-md transition ${
                  selectedBarSeats.length >
                    0 &&
                  selectedBarSeats.length !==
                    guests
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[#8a5639] hover:bg-[#70442e]"
                }`}
              >
                Продолжить бронирование →
              </button>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

// ==================================================
// INFO BOX
// ==================================================

function InfoBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f8f4ef] p-4">

      <p className="text-xs font-semibold uppercase tracking-wider text-[#95857b]">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-[#30251f]">
        {value}
      </p>

    </div>
  );
}

// ==================================================
// ZONE
// ==================================================

function ZoneBlock({
  title,
  subtitle,
  icon,
  color,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: "blue" | "brown" | "green";
  children: React.ReactNode;
}) {
  const styles = {
    blue: {
      box: "border-sky-200 bg-sky-50/70",
      badge:
        "bg-sky-100 text-sky-700",
    },

    brown: {
      box:
        "border-[#d4c6bb] bg-[#f8f4ef]",
      badge:
        "bg-[#e8ded5] text-[#765544]",
    },

    green: {
      box:
        "border-emerald-200 bg-emerald-50/70",
      badge:
        "bg-emerald-100 text-emerald-700",
    },
  };

  return (
    <div
      className={`rounded-[2rem] border-2 p-5 ${styles[color].box}`}
    >

      <div className="mb-5 text-center">

        <span
          className={`inline-flex rounded-full px-5 py-2 text-sm font-bold ${styles[color].badge}`}
        >
          {icon} {title}
        </span>

        <p className="mt-2 text-xs text-[#85776e]">
          {subtitle}
        </p>

      </div>

      {children}

    </div>
  );
}

// ==================================================
// TABLE
// ==================================================

function TableVisual({
  table,
  suitable,
  selected,
  onClick,
}: {
  table: Table;
  suitable: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!suitable}
      onClick={onClick}
      className={`group relative min-h-[125px] rounded-[1.5rem] border-2 p-4 text-center transition-all ${
        selected
          ? "scale-105 border-[#c88732] bg-[#f6d9a8] shadow-xl"
          : suitable
          ? "border-[#cfc3ba] bg-white hover:-translate-y-1 hover:border-[#bd793e] hover:shadow-lg"
          : "cursor-not-allowed border-[#d5d0cc] bg-[#ddd8d4] opacity-55"
      }`}
    >

      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${
          selected
            ? "bg-[#d69a48]"
            : suitable
            ? "bg-[#f2ebe5] group-hover:bg-[#eee0d5]"
            : "bg-[#c9c4c0]"
        }`}
      >
        🪑
      </div>

      <p className="font-bold text-[#332923]">
        №{table.number}
      </p>

      <p className="mt-1 text-xs text-[#756860]">
        {table.seats}{" "}
        {table.seats === 1
          ? "место"
          : "мест"}
      </p>

      {!suitable && (
        <span className="absolute right-3 top-3 text-xs font-bold text-[#877b74]">
          ×
        </span>
      )}

    </button>
  );
}

// ==================================================
// BAR SEAT
// ==================================================

function BarSeat({
  table,
  suitable,
  selected,
  onClick,
}: {
  table: Table;
  suitable: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!suitable}
      onClick={onClick}
      className={`group relative rounded-2xl border-2 p-3 text-center transition-all ${
        selected
          ? "scale-105 border-[#c88732] bg-[#f6d9a8] shadow-lg"
          : suitable
          ? "border-purple-200 bg-white hover:-translate-y-1 hover:border-purple-400 hover:shadow-md"
          : "cursor-not-allowed border-gray-300 bg-gray-200 opacity-50"
      }`}
    >

      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-xl ${
          selected
            ? "bg-[#d69a48]"
            : suitable
            ? "bg-purple-100"
            : "bg-gray-300"
        }`}
      >
        🪑
      </div>

      <p className="mt-2 text-xs font-bold text-[#332923]">
        Место {table.number}
      </p>

      <p className="mt-1 text-[10px] text-purple-700">
        1 гость
      </p>

      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b5638] text-xs font-bold text-white">
          ✓
        </span>
      )}

    </button>
  );
}

// ==================================================
// EMPTY ZONE
// ==================================================

function EmptyZone() {
  return (
    <div className="rounded-2xl border border-dashed border-[#cbbeb4] bg-white/60 p-6 text-center">

      <div className="text-3xl">
        🪑
      </div>

      <p className="mt-2 text-sm font-semibold text-[#7d7068]">
        Места пока не добавлены
      </p>

      <p className="mt-1 text-xs text-[#a09289]">
        Зона предусмотрена схемой ресторана
      </p>

    </div>
  );
}

// ==================================================
// LEGEND
// ==================================================

function Legend({
  className,
  text,
}: {
  className: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-4 w-4 rounded border ${className}`}
      />

      {text}

    </div>
  );
}