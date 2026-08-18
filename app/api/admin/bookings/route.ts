import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function isAdminAuthenticated(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";

  return cookieHeader
    .split(";")
    .some(
      (cookie) =>
        cookie.trim() === "admin_authenticated=true"
    );
}

export async function GET(request: Request) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        {
          error: "Требуется авторизация администратора",
        },
        {
          status: 401,
        }
      );
    }

    const bookings = await prisma.booking.findMany({
      include: {
        client: true,
        table: {
          include: {
            zone: true,
          },
        },
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          time: "desc",
        },
      ],
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(
      "Ошибка загрузки бронирований администратора:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось загрузить бронирования",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        {
          error: "Требуется авторизация администратора",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const bookingId = Number(body.bookingId);
    const status = String(body.status || "").trim();

    const allowedStatuses = [
      "created",
      "confirmed",
      "cancelled",
    ];

    if (!bookingId || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
        },
        {
          status: 400,
        }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Бронирование не найдено",
        },
        {
          status: 404,
        }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Ошибка изменения статуса:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось изменить статус бронирования",
      },
      {
        status: 500,
      }
    );
  }
}