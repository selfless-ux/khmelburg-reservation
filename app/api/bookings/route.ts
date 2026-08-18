import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Не указан номер телефона" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        phone: phone.trim(),
      },
    });

    if (!client) {
      return NextResponse.json([]);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        clientId: client.id,
      },
      include: {
        table: {
          include: {
            zone: true,
          },
        },
        client: true,
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
      "Ошибка загрузки бронирований:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось загрузить бронирования",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /*
     * ==================================================
     * ПОЛУЧЕНИЕ ID СТОЛИКОВ
     * ==================================================
     *
     * tableId  — обычный столик
     * tableIds — несколько мест у бара
     */

    const singleTableId: number | null =
      body.tableId !== undefined &&
      body.tableId !== null &&
      body.tableId !== ""
        ? Number(body.tableId)
        : null;

    const receivedTableIds: number[] =
      Array.isArray(body.tableIds)
        ? body.tableIds
            .map((id: unknown): number => Number(id))
            .filter(
              (id: number): id is number =>
                Number.isFinite(id) && id > 0
            )
        : [];

    const tableIds: number[] = Array.from(
      new Set<number>(
        receivedTableIds.length > 0
          ? receivedTableIds
          : singleTableId &&
              Number.isFinite(singleTableId)
            ? [singleTableId]
            : []
      )
    );

    /*
     * ==================================================
     * ДАННЫЕ БРОНИРОВАНИЯ
     * ==================================================
     */

    const guests = Number(body.guests);
    const date = String(body.date || "").trim();
    const time = String(body.time || "").trim();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();

    const email = body.email
      ? String(body.email).trim()
      : null;

    const comment = body.comment
      ? String(body.comment).trim()
      : null;

    /*
     * ==================================================
     * ПРОВЕРКА ОБЯЗАТЕЛЬНЫХ ПОЛЕЙ
     * ==================================================
     */

    if (
      tableIds.length === 0 ||
      !guests ||
      !date ||
      !time ||
      !name ||
      !phone
    ) {
      return NextResponse.json(
        {
          error:
            "Заполнены не все обязательные поля",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * ПРОВЕРКА КОЛИЧЕСТВА ГОСТЕЙ
     * ==================================================
     */

    if (guests < 1 || guests > 20) {
      return NextResponse.json(
        {
          error:
            "Количество гостей должно быть от 1 до 20",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * ЗАГРУЗКА ВЫБРАННЫХ СТОЛИКОВ
     * ==================================================
     */

    const tables = await prisma.restaurantTable.findMany({
      where: {
        id: {
          in: tableIds,
        },
      },
      include: {
        zone: true,
      },
    });

    /*
     * Проверяем, что нашли абсолютно все
     * выбранные места.
     */

    if (tables.length !== tableIds.length) {
      return NextResponse.json(
        {
          error:
            "Один или несколько выбранных столиков не найдены",
        },
        { status: 404 }
      );
    }

    /*
     * ==================================================
     * РАЗДЕЛЯЕМ БАР И ОБЫЧНЫЕ СТОЛИКИ
     * ==================================================
     */

    const barTables = tables.filter(
      (table) =>
        table.zone.name === "Барная зона"
    );

    const regularTables = tables.filter(
      (table) =>
        table.zone.name !== "Барная зона"
    );

    /*
     * ==================================================
     * НЕЛЬЗЯ СМЕШИВАТЬ БАР И ОБЫЧНЫЙ СТОЛИК
     * ==================================================
     */

    if (
      barTables.length > 0 &&
      regularTables.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Нельзя одновременно выбирать обычный столик и барные места",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * ЛОГИКА БАРА
     * ==================================================
     *
     * Каждое барное место = 1 человек.
     *
     * Например:
     *
     * 1 гость → [4]
     * 2 гостя → [4, 5]
     * 3 гостя → [4, 5, 6]
     */

    const isBarBooking =
      barTables.length > 0;

    if (isBarBooking) {
      if (barTables.length !== guests) {
        return NextResponse.json(
          {
            error:
              `Для ${guests} гостей необходимо выбрать ${guests} барных мест`,
          },
          { status: 400 }
        );
      }

      for (const table of barTables) {
        if (table.seats !== 1) {
          return NextResponse.json(
            {
              error:
                `Место №${table.number} в барной зоне должно иметь вместимость 1 человек`,
            },
            { status: 400 }
          );
        }
      }
    }

    /*
     * ==================================================
     * ЛОГИКА ОБЫЧНОГО СТОЛИКА
     * ==================================================
     */

    if (!isBarBooking) {
      if (regularTables.length !== 1) {
        return NextResponse.json(
          {
            error:
              "Для обычной зоны можно выбрать только один столик",
          },
          { status: 400 }
        );
      }

      const regularTable =
        regularTables[0];

      if (guests > regularTable.seats) {
        return NextResponse.json(
          {
            error:
              `Столик рассчитан максимум на ${regularTable.seats} гостей`,
          },
          { status: 400 }
        );
      }
    }

    /*
     * ==================================================
     * ДАТА
     * ==================================================
     */

    const bookingDate = new Date(
      `${date}T00:00:00.000Z`
    );

    if (
      Number.isNaN(
        bookingDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Некорректная дата бронирования",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * ПРОВЕРКА ЗАНЯТОСТИ ВСЕХ ВЫБРАННЫХ МЕСТ
     * ==================================================
     */

    const existingBookings =
      await prisma.booking.findMany({
        where: {
          tableId: {
            in: tableIds,
          },
          date: bookingDate,
          time,
          status: {
            not: "cancelled",
          },
        },
        include: {
          table: {
            include: {
              zone: true,
            },
          },
        },
      });

    if (existingBookings.length > 0) {
      const occupiedNumbers =
        existingBookings
          .map(
            (booking) =>
              `№${booking.table.number}`
          )
          .join(", ");

      return NextResponse.json(
        {
          error:
            `Следующие места уже забронированы: ${occupiedNumbers}`,
        },
        { status: 409 }
      );
    }

    /*
     * ==================================================
     * ПОИСК ИЛИ СОЗДАНИЕ КЛИЕНТА
     * ==================================================
     */

    let client =
      await prisma.client.findFirst({
        where: {
          phone,
        },
      });

    if (client) {
      client =
        await prisma.client.update({
          where: {
            id: client.id,
          },
          data: {
            fullName: name,
            email,
          },
        });
    } else {
      client =
        await prisma.client.create({
          data: {
            fullName: name,
            phone,
            email,
          },
        });
    }

    /*
     * ==================================================
     * СОЗДАНИЕ БРОНИРОВАНИЙ
     * ==================================================
     *
     * Обычный столик:
     *
     * tableId = 3
     * guests = 4
     *
     * → одна запись Booking
     *
     *
     * Бар:
     *
     * tableIds = [4, 5]
     * guests = 2
     *
     * → две записи Booking
     *
     * место 4 → guests = 1
     * место 5 → guests = 1
     */

    const bookings = [];

    for (const tableId of tableIds) {
      const booking =
        await prisma.booking.create({
          data: {
            clientId: client.id,
            tableId,
            date: bookingDate,
            time,
            guests: isBarBooking
              ? 1
              : guests,
            status: "created",
            comment,
          },
          include: {
            table: {
              include: {
                zone: true,
              },
            },
            client: true,
          },
        });

      bookings.push(booking);
    }

    /*
     * ==================================================
     * ОТВЕТ
     * ==================================================
     */

    return NextResponse.json(
      {
        success: true,

        // Для совместимости со старой логикой
        booking: bookings[0],

        // Все созданные бронирования
        bookings,

        // ID всех бронирований
        bookingIds: bookings.map(
          (booking) => booking.id
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Ошибка создания бронирования:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось создать бронирование",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const bookingId = Number(
      body.bookingId
    );

    const phone = String(
      body.phone || ""
    ).trim();

    if (!bookingId || !phone) {
      return NextResponse.json(
        {
          error:
            "Не указан номер бронирования или телефон",
        },
        { status: 400 }
      );
    }

    /*
     * Ищем бронирование вместе с клиентом
     * и столиком.
     */

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          client: true,
          table: {
            include: {
              zone: true,
            },
          },
        },
      });

    if (!booking) {
      return NextResponse.json(
        {
          error:
            "Бронирование не найдено",
        },
        { status: 404 }
      );
    }

    /*
     * Проверяем владельца бронирования.
     */

    if (
      booking.client.phone !== phone
    ) {
      return NextResponse.json(
        {
          error:
            "Нет доступа к этому бронированию",
        },
        { status: 403 }
      );
    }

    /*
     * Проверяем повторную отмену.
     */

    if (
      booking.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "Бронирование уже отменено",
        },
        { status: 400 }
      );
    }

    /*
     * Отменяем бронирование.
     */

    const updatedBooking =
      await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: "cancelled",
        },
        include: {
          table: {
            include: {
              zone: true,
            },
          },
          client: true,
        },
      });

    return NextResponse.json(
      updatedBooking
    );
  } catch (error) {
    console.error(
      "Ошибка отмены бронирования:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось отменить бронирование",
      },
      { status: 500 }
    );
  }
}