import { useState } from "react";
import type { SyntheticEvent } from "react";
import { login } from "../api/auth";
import Register from "./Register";

interface Props {
    onLogin: () => void;
}

function Login({ onLogin }: Props) {
    const [email, setEmail] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: SyntheticEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);
            onLogin();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    }

    if (mode === "register") {
        return (
            <Register
                onRegistered={onLogin}
                onBack={() => setMode("login")}
            />
        );
    }

    return (
        <main className="app">
            <header className="header">
                <div className="header-title">
                    <h1>Tody</h1>

                    <span className="date">
                        Know what to do.
                    </span>
                </div>
            </header>

            <section className="login">
                <p className="label">
                    WELCOME BACK
                </p>

                <h2>Sign in</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                    <button
                        type="button"
                        className="register-link"
                        onClick={() => {
                            setMode("register");
                        }}
                    >
                        Create an account
                    </button>
                </form>
            </section>
        </main>
    );
}

export default Login;