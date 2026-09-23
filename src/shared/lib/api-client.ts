export type ApiResponse<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; status: number; error: string; details?: unknown };

/**
 * Robust typed fetch wrapper for TechTrack API calls.
 * Preserves HTTP status, parsed error messages, validation details,
 * and handles non-JSON / network failures gracefully.
 */
export async function requestApi<T>(
  input: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type") && init?.body && typeof init.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(input, {
      ...init,
      headers,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (response.ok) {
      if (response.status === 204) {
        return { ok: true, data: undefined as unknown as T, status: response.status };
      }
      const data = isJson ? await response.json() : await response.text();
      return { ok: true, data: data as T, status: response.status };
    }

    // Handle error status
    if (isJson) {
      const errBody = (await response.json()) as { error?: string; details?: unknown; message?: string };
      return {
        ok: false,
        status: response.status,
        error: errBody.error || errBody.message || `Request failed with status ${response.status}`,
        details: errBody.details,
      };
    }

    const textError = await response.text();
    return {
      ok: false,
      status: response.status,
      error: textError || `HTTP error ${response.status}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return {
      ok: false,
      status: 0,
      error: message,
    };
  }
}

export function apiGet<T>(url: string) {
  return requestApi<T>(url, { method: "GET" });
}

export function apiPost<T>(url: string, body?: unknown) {
  return requestApi<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(url: string, body?: unknown) {
  return requestApi<T>(url, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(url: string) {
  return requestApi<T>(url, { method: "DELETE" });
}

