// src/lib/api.ts (React / Next / Vite example)
export async function getUsers() {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/users`,   // ← variable you created
    { credentials: "include" }                    // if you use cookies
  );
  if (!res.ok) throw new Error(`API ${res.statusText}`);
  return res.json();
}
