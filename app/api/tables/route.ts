import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    console.log("=== TABLES API: START ===");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    const tables = await prisma.restaurantTable.findMany({
      include: {
        zone: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    console.log("=== TABLES API: FOUND ===", tables.length);

    return NextResponse.json(tables);
  } catch (error) {
    console.error("=== TABLES API ERROR ===");
    console.error(error);

    return NextResponse.json(
      {
        error: "Не удалось загрузить столики",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      }
    );
  }
}