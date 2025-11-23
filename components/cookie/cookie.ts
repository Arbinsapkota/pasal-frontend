export function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function getUserFromCookies(): any | null {
  if (typeof window !== "undefined" && document.cookie) {
    // Check if window and document.cookie are available
    const cookies = document.cookie.split(";");
    const userCookie = cookies.find(cookie =>
      cookie.trim().startsWith("ETECH-mh#56O=")
    );

    if (userCookie) {
      const userValue = userCookie.split("=")[1];
      try {
        // Decode the JWT and extract the payload
        return decodeJWT(decodeURIComponent(userValue));
      } catch (error) {
        console.error("Failed to parse user data from cookies:", error);
        return null;
      }
    }
  }
}

export function getTokenFromCookies(): any | null {
  if (typeof window !== "undefined" && document.cookie) {
    // Check if window and document.cookie are available
    const cookies = document.cookie.split(";");
    const userCookie = cookies.find(cookie =>
      cookie.trim().startsWith("ETECH-mh#56O=")
    );

    if (userCookie) {
      const userValue = userCookie.split("=")[1];
      try {
        return JSON.parse(decodeURIComponent(userValue));
      } catch (error) {
        console.error("Failed to parse user data from cookies:", error);
        return null;
      }
    }
  }
}

// Function to set user data in a cookie
export function setUserCookie(data: any) {
  const userValue = encodeURIComponent(JSON.stringify(data));
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 6); // Cookie expires in 6hrs
  const isAdmin = decodeJWT(data)?.role === "SUPER_ADMIN";
  let cookieData = `ETECH-mh#56O=${userValue};  path=/; SameSite=Strict`;
  // If you're an admin, you can't have persistent see
  if (!isAdmin) {
    cookieData += `; expires=${expiryDate.toUTCString()};`;
  }

  document.cookie = cookieData;
}

// export async function setUserCookie(data: any){
//   try {

//   }
// }

export function clearCookies() {
  // Get all cookies
  const cookies = document.cookie.split(";");

  // Loop through cookies and delete each one
  for (const cookie of cookies) {
    // Extract cookie name
    const cookieName = cookie.split("=")[0].trim();
    // Set cookie to expire in the past
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

// Old Cookie Method

export const setCookie = (
  name: string,
  value: string,
  options: { [key: string]: any }
) => {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  for (const [key, val] of Object.entries(options)) {
    cookieString += `; ${key}`;
    if (val !== true) {
      cookieString += `=${val}`;
    }
  }
  document.cookie = cookieString;
};

export const getCookie = (name: string): string | undefined => {
  const cookies = document.cookie
    .split("; ")
    .reduce((acc: { [key: string]: string }, cookie) => {
      const [key, value] = cookie.split("=");
      acc[decodeURIComponent(key)] = decodeURIComponent(value);
      return acc;
    }, {});
  return cookies[name];
};

export const deleteCookie = (name: string) => {
  setCookie(name, "", { "max-age": -1 });
};
