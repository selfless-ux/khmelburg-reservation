import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Заполнение базы данных...");

  await prisma.booking.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.role.deleteMany();

  // --------------------------------------------------
  // РОЛИ
  // --------------------------------------------------

  const clientRole = await prisma.role.create({
    data: {
      name: "Клиент",
    },
  });

  await prisma.role.create({
    data: {
      name: "Администратор ресторана",
    },
  });

  await prisma.role.create({
    data: {
      name: "Руководитель",
    },
  });

  await prisma.role.create({
    data: {
      name: "Системный администратор",
    },
  });

  // --------------------------------------------------
  // ЗОНЫ
  // --------------------------------------------------

  const mainHall = await prisma.zone.create({
    data: {
      name: "Основной зал",
      description:
        "Основная зона ресторана с центральными столиками",
    },
  });

  const quietZone = await prisma.zone.create({
    data: {
      name: "Тихая зона",
      description:
        "Спокойная зона для гостей, предпочитающих уединённую атмосферу",
    },
  });

  const barZone = await prisma.zone.create({
    data: {
      name: "Барная зона",
      description:
        "Барная стойка с индивидуальными посадочными местами",
    },
  });

  const windowZone = await prisma.zone.create({
    data: {
      name: "Зона у окна",
      description:
        "Столики, расположенные вдоль окон ресторана",
    },
  });

  // --------------------------------------------------
  // СТОЛИКИ
  // --------------------------------------------------

  await prisma.restaurantTable.createMany({
    data: [
      // ==============================
      // ЗОНА У ОКНА
      // ==============================

      {
        number: 1,
        seats: 2,
        zoneId: windowZone.id,
        status: "available",
        features: "У окна",
      },
      {
        number: 2,
        seats: 2,
        zoneId: windowZone.id,
        status: "available",
        features: "У окна",
      },
      {
        number: 3,
        seats: 4,
        zoneId: windowZone.id,
        status: "available",
        features: "У окна",
      },
      {
        number: 4,
        seats: 4,
        zoneId: windowZone.id,
        status: "available",
        features: "У окна",
      },

      // ==============================
      // ОСНОВНОЙ ЗАЛ
      // ==============================

      {
        number: 5,
        seats: 2,
        zoneId: mainHall.id,
        status: "available",
        features: null,
      },
      {
        number: 6,
        seats: 4,
        zoneId: mainHall.id,
        status: "available",
        features: null,
      },
      {
        number: 7,
        seats: 4,
        zoneId: mainHall.id,
        status: "available",
        features: null,
      },
      {
        number: 8,
        seats: 6,
        zoneId: mainHall.id,
        status: "available",
        features: null,
      },
      {
        number: 9,
        seats: 6,
        zoneId: mainHall.id,
        status: "available",
        features: null,
      },
      {
        number: 10,
        seats: 8,
        zoneId: mainHall.id,
        status: "available",
        features: "У выхода",
      },

      // ==============================
      // ТИХАЯ ЗОНА
      // ==============================

      {
        number: 11,
        seats: 1,
        zoneId: quietZone.id,
        status: "available",
        features: "Тихая зона",
      },
      {
        number: 12,
        seats: 2,
        zoneId: quietZone.id,
        status: "available",
        features: "Тихая зона",
      },
      {
        number: 13,
        seats: 2,
        zoneId: quietZone.id,
        status: "available",
        features: "Тихая зона",
      },
      {
        number: 14,
        seats: 4,
        zoneId: quietZone.id,
        status: "available",
        features: "Тихая зона",
      },

      // ==============================
      // БАР
      // Каждое место = отдельный
      // объект на 1 человека
      // ==============================

      {
        number: 15,
        seats: 1,
        zoneId: barZone.id,
        status: "available",
        features: "У бара",
      },
      {
        number: 16,
        seats: 1,
        zoneId: barZone.id,
        status: "available",
        features: "У бара",
      },
      {
        number: 17,
        seats: 1,
        zoneId: barZone.id,
        status: "available",
        features: "У бара",
      },
      {
        number: 18,
        seats: 1,
        zoneId: barZone.id,
        status: "available",
        features: "У бара",
      },
      {
        number: 19,
        seats: 1,
        zoneId: barZone.id,
        status: "available",
        features: "У бара",
      },
      {
        number: 20,
        seats: 1,
        zoneId: barZone.id,
        status: "available",
        features: "У бара",
      },
    ],
  });

  // --------------------------------------------------
  // ТЕСТОВЫЙ ПОЛЬЗОВАТЕЛЬ
  // --------------------------------------------------

  await prisma.user.create({
    data: {
      login: "client",
      password: "demo",
      phone: "+7 900 000-00-01",
      email: "client@example.ru",
      roleId: clientRole.id,
    },
  });

  console.log("База данных успешно заполнена!");
}

main()
  .catch((error) => {
    console.error("Ошибка:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });