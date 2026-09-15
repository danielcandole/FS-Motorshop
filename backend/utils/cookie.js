export function getCookie(request, name) {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) { return null; }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [cookieName, ...cookieValue] = cookie.trim().split("=");  
    
    if (cookieName === name) {
      return decodeURIComponent(cookieValue.join("="));
    }
  }

  return null;
}













