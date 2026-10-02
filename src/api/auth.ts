import { request } from "./client";
import { setToken } from "../storage/auth";

interface LoginResponse {
    token: string;
}

interface MeResponse {
    success: boolean;
    user: {
        id: string;
        email: string;
        name?: string;
    };
}

export async function login(
    email: string,
    password: string
): Promise<void> {
    const response =
        await request<LoginResponse>(
            "/auth/login",
            {
                method: "POST",
                authenticated: false,
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

    await setToken(response.token);
}

export async function getMe(): Promise<MeResponse["user"]> {
    const response = await request<MeResponse>(
        "/auth/me"
    );

    return response.user;
}