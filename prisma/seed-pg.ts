import "dotenv/config";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Подключение к PostgreSQL...");

  await client.connect();

  console.log("Подключение OK");

  await client.query("BEGIN");

  try {
    // Очищаем только данные приложения
    await client.query('DELETE FROM "Booking"');
    await client.query('DELETE FROM "Client"');
    await client.query('DELETE FROM "User"');
    await client.query('DELETE FROM "RestaurantTable"');
    await client.query('DELETE FROM "Zone"');
    await client.query('DELETE FROM "Role"');

    // Роли
    const roles = [
      "Клиент",
      "Администратор ресторана",
      "Руководитель",
      "Системный администратор",
    ];

    for (const name of roles) {
      await client.query(
        'INSERT INTO "Role" ("name") VALUES ($1)',
        [name]
      );
    }

    // Зоны
    const zones = [
      [
        "Основной зал",
        "Основная зона ресторана с центральными столиками",
      ],
      [
        "Тихая зона",
        "Спокойная зона для гостей, предпочитающих уединённую атмосферу",
      ],
      [
        "Барная зона",
        "Барная стойка с индивидуальными посадочными местами",
      ],
      [
        "Зона у окна",
        "Столики, расположенные вдоль окон ресторана",
      ],
    ];

    const zoneIds: Record<string, number> = {};

    for (const [name, description] of zones) {
      const result = await client.query(
        'INSERT INTO "Zone" ("name", "description") VALUES ($1, $2) RETURNING id',
        [name, description]
      );

      zoneIds[name] = result.rows[0].id;
    }

    // Столики
    const tables = [
      [1, 2, "Зона у окна", "У окна"],
      [2, 2, "Зона у окна", "У окна"],
      [3, 4, "Зона у окна", "У окна"],
      [4, 4, "Зона у окна", "У окна"],

      [5, 2, "Основной зал", null],
      [6, 4, "Основной зал", null],
      [7, 4, "Основной зал", null],
      [8, 6, "Основной зал", null],
      [9, 6, "Основной зал", null],
      [10, 8, "Основной зал", "У выхода"],

      [11, 1, "Тихая зона", "Тихая зона"],
      [12, 2, "Тихая зона", "Тихая зона"],
      [13, 2, "Тихая зона", "Тихая зона"],
      [14, 4, "Тихая зона", "Тихая зона"],

      [15, 1, "Барная зона", "У бара"],
      [16, 1, "Барная зона", "У бара"],
      [17, 1, "Барная зона", "У бара"],
      [18, 1, "Барная зона", "У бара"],
      [19, 1, "Барная зона", "У бара"],
      [20, 1, "Барная зона", "У бара"],
    ];

    for (const [number, seats, zone, features] of tables) {
      await client.query(
        `INSERT INTO "RestaurantTable"
          ("number", "seats", "status", "features", "zoneId")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          number,
          seats,
          "available",
          features,
          zoneIds[zone as string],
        ]
      );
    }

    // Тестовый пользователь
    const roleResult = await client.query(
      'SELECT id FROM "Role" WHERE "name" = $1',
      ["Клиент"]
    );

    await client.query(
      `INSERT INTO "User"
        ("login", "password", "phone", "email", "roleId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        "client",
        "demo",
        "+7 900 000-00-01",
        "client@example.ru",
        roleResult.rows[0].id,
      ]
    );

    await client.query("COMMIT");

    console.log("БАЗА УСПЕШНО ЗАПОЛНЕНА!");
    console.log("Столиков добавлено: 20");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("ПОЛНАЯ ОШИБКА:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
