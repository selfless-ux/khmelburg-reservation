import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
  });

  try {
    await client.connect();

    console.log("TABLES API: PostgreSQL подключен");

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

    const tables = result.rows.map((table) => ({
      id: table.id,
      number: table.number,
      seats: table.seats,
      status: table.status,
      features: table.features,
      zoneId: table.zoneId,
      zone: table.zone_id
        ? {
            id: table.zone_id,
            name: table.zone_name,
            description: table.zone_description,
          }
        : null,
    }));

    console.log(`TABLES API: найдено столиков: ${tables.length}`);

    return NextResponse.json(tables);
  } catch (error) {
    console.error("TABLES API ERROR:", error);

    return NextResponse.json(
      {
        error: "Не удалось загрузить столики",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    try {
      await client.end();
    } catch {}
  }
}