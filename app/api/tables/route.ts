import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      include: {
        zone: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Ошибка загрузки столиков:", error);

    return NextResponse.json(
      {
        error: "Не удалось загрузить столики",
      },
      {
        status: 500,
      }
    );
  }
}