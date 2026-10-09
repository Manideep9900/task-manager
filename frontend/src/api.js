const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection."
    );
  }

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("session-expired"));

    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong. Please try again."
    );
  }

  return data;
}