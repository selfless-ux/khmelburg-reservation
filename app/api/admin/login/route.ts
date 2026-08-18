import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const login = String(body.login || "").trim();
    const password = String(body.password || "").trim();

    if (!login || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Введите логин и пароль",
        },
        { status: 400 }
      );
    }

    const adminLogin = process.env.ADMIN_LOGIN;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminLogin || !adminPassword) {
      console.error(
        "ADMIN_LOGIN или ADMIN_PASSWORD не указаны в .env"
      );

      return NextResponse.json(
        {
          success: false,
          error: "Сервер авторизации не настроен",
        },
        { status: 500 }
      );
    }

    if (
      login !== adminLogin ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Неверный логин или пароль",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Авторизация успешна",
    });

    response.cookies.set("admin_authenticated", "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Ошибка авторизации:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Ошибка сервера",
      },
      { status: 500 }
    );
  }
}