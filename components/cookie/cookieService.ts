"use server";

import { cookies } from "next/headers";

export async function setUserCookie(data: any) {
  const cookieStore = await cookies();
  const userValue = JSON.stringify(data);
  cookieStore.set("user", userValue, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 6 * 60 * 60,
  });
}

