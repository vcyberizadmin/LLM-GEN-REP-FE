// src/lib/api.ts (React / Next / Vite example)
export async function getUsers() {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/users`,   // ← variable you created
    { credentials: "include" }                    // if you use cookies
  );
  if (!res.ok) throw new Error(`API ${res.statusText}`);
  return res.json();
}

export interface ZipVisualizationResponse {
  slides: string[]
  message?: string
}

/**
 * Upload a ZIP file for visualization
 * @param file The ZIP archive to send
 * @returns Slide image URLs and optional message
 */
export async function visualizeZip(file: File): Promise<ZipVisualizationResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/visualize/zip`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to visualize ZIP')
  }
  return res.json()
}
