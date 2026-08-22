import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL не найден");

    return NextResponse.json(
      {
        error: "DATABASE_URL не настроен",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);

  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
  });

  try {
    await client.connect();

    console.log("TABLES API: PostgreSQL подключен");

    /*
     * ==================================================
     * ЗАГРУЖАЕМ ВСЕ СТОЛИКИ
     * ==================================================
     */

    const result = await client.query(`
      SELECT
        rt.id,
        rt.number,
        rt.seats,
        rt.status,
        rt.features,
        rt."zoneId",
        z.id AS "zone_id",
        z.name AS "zone_name",
        z.description AS "zone_description"
      FROM "RestaurantTable" rt
      LEFT JOIN "Zone" z
        ON z.id = rt."zoneId"
      ORDER BY rt.number ASC
    `);

    /*
     * ==================================================
     * НАХОДИМ ЗАНЯТЫЕ СТОЛИКИ
     * ==================================================
     *
     * Проверяем только тогда, когда пользователь
     * передал дату и время.
     */

    let bookedTableIds: number[] = [];

    if (date && time) {
      const bookingDate = new Date(
        `${date}T00:00:00.000Z`
      );

      if (!Number.isNaN(bookingDate.getTime())) {
        const bookingsResult = await client.query(
          `
            SELECT "tableId"
            FROM "Booking"
            WHERE
              date = $1
              AND time = $2
              AND status != 'cancelled'
          `,
          [bookingDate, time]
        );

        bookedTableIds = bookingsResult.rows
          .map((row) => Number(row.tableId))
          .filter((id) => Number.isFinite(id));

        console.log(
          `TABLES API: занятых столиков на ${date} ${time}:`,
          bookedTableIds
        );
      }
    }

    /*
     * ==================================================
     * ФОРМИРУЕМ ОТВЕТ
     * ==================================================
     */

    const tables = result.rows.map((table) => {
      const isBookedForSelectedTime =
        bookedTableIds.includes(Number(table.id));

      return {
        id: table.id,
        number: table.number,
        seats: table.seats,

        /*
         * Если столик уже занят на выбранные дату/время,
         * возвращаем booked.
         *
         * Иначе оставляем его обычный статус.
         */
        status: isBookedForSelectedTime
          ? "booked"
          : table.status,

        features: table.features,
        zoneId: table.zoneId,

        zone: table.zone_id
          ? {
              id: table.zone_id,
              name: table.zone_name,
              description: table.zone_description,
            }
          : null,
      };
    });

    console.log(
      `TABLES API: найдено столиков: ${tables.length}`
    );

    return NextResponse.json(tables);
  } catch (error) {
    console.error("TABLES API ERROR:", error);

    return NextResponse.json(
      {
        error: "Не удалось загрузить столики",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  } finally {
    try {
      await client.end();
    } catch {}
  }
}
