import { setUserCookie } from "@/components/cookie/cookieService";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  await setUserCookie(body);

  return new Response("Cookie set!", { status: 200 });
}


