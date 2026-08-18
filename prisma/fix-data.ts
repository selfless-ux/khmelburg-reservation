import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Исправляем кодировку данных...");

  // ==========================================
  // ЗОНЫ
  // ==========================================

  const zones = [
    {
      oldName: "Р—РѕРЅР° Сѓ РѕРєРЅР°",
      newName: "Зона у окна",
      description: "Столики рядом с окнами",
    },
    {
      oldName: "РћСЃРЅРѕРІРЅРѕР№ Р·Р°Р»",
      newName: "Основной зал",
      description: "Основная зона ресторана",
    },
    {
      oldName: "РўРёС…Р°СЏ Р·РѕРЅР°",
      newName: "Тихая зона",
      description: "Спокойная зона для комфортного отдыха",
    },
    {
      oldName: "Р‘Р°СЂРЅР°СЏ Р·РѕРЅР°",
      newName: "Барная зона",
      description: "Индивидуальные посадочные места у бара",
    },
    {
      oldName: "Р—РѕРЅР° Сѓ РІС‹С…РѕРґР°",
      newName: "Зона у выхода",
      description: "Столики рядом с выходом",
    },
  ];

  for (const zone of zones) {
    const existing = await prisma.zone.findUnique({
      where: {
        name: zone.oldName,
      },
    });

    if (existing) {
      await prisma.zone.update({
        where: {
          id: existing.id,
        },
        data: {
          name: zone.newName,
          description: zone.description,
        },
      });

      console.log(
        `✓ Зона исправлена: ${zone.newName}`
      );
    } else {
      const alreadyFixed =
        await prisma.zone.findUnique({
          where: {
            name: zone.newName,
          },
        });

      if (alreadyFixed) {
        console.log(
          `✓ Уже исправлена: ${zone.newName}`
        );
      } else {
        console.log(
          `⚠ Зона не найдена: ${zone.oldName}`
        );
      }
    }
  }

  // ==========================================
  // FEATURES СТОЛИКОВ
  // ==========================================

  const featureMap = [
    {
      oldValue: "РЈ РѕРєРЅР°",
      newValue: "У окна",
    },
    {
      oldValue: "РЈ Р±Р°СЂР°",
      newValue: "У бара",
    },
    {
      oldValue: "РўРёС…Р°СЏ Р·РѕРЅР°",
      newValue: "Тихая зона",
    },
    {
      oldValue: "РЈ РІС‹С…РѕРґР°",
      newValue: "У выхода",
    },
  ];

  const tables =
    await prisma.restaurantTable.findMany();

  for (const table of tables) {
    let features = table.features;

    if (features) {
      for (const item of featureMap) {
        features = features.replace(
          item.oldValue,
          item.newValue
        );
      }
    }

    if (features !== table.features) {
      await prisma.restaurantTable.update({
        where: {
          id: table.id,
        },
        data: {
          features,
        },
      });
    }
  }

  console.log("✓ Характеристики столиков исправлены");

  // ==========================================
  // ПРОВЕРКА
  // ==========================================

  const result =
    await prisma.restaurantTable.findMany({
      include: {
        zone: true,
      },
      orderBy: {
        number: "asc",
      },
    });

  console.log("\n==============================");
  console.log("ПРОВЕРКА");
  console.log("==============================");

  for (const table of result) {
    console.log(
      `Столик №${table.number}: ${table.zone.name} | ${table.seats} мест | ${table.features ?? "без особенностей"}`
    );
  }

  console.log(
    `\nВсего столиков: ${result.length}`
  );
}

main()
  .catch((error) => {
    console.error(
      "Ошибка исправления:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });