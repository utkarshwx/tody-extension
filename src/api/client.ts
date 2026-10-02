import { getToken } from "../storage/auth";

const API_BASE_URL = "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
    authenticated?: boolean;
}

export async function request<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        authenticated = true,
        ...fetchOptions
    } = options;

    const headers = new Headers(
        fetchOptions.headers
    );

    headers.set(
        "Content-Type",
        "application/json"
    );

    if (authenticated) {
        const token = await getToken();

        if (token) {
            headers.set(
                "Authorization",
                `Bearer ${token}`
            );
        }
    }

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
            ...fetchOptions,
            headers
        }
    );

    if (!response.ok) {
        let message = `Request failed: ${response.status}`;

        try {
            const body = await response.json();

            if (body.message) {
                message = body.message;
            }
        } catch {
            // Response wasn't JSON.
        }

        throw new Error(message);
    }

    return response.json();
}