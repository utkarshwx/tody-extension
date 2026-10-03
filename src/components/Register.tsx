import { useState, type FormEvent } from "react";
import { register } from "../api/auth";

interface RegisterProps {
    onRegistered: () => void;
    onBack: () => void;
}

function Register({
    onRegistered,
    onBack
}: RegisterProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            setError("Name is required.");
            return;
        }

        if (!trimmedEmail) {
            setError("Email is required.");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await register(
                trimmedName,
                trimmedEmail,
                password
            );

            onRegistered();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create account.");
            }
        } finally {
            setLoading(false);
        }
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

            <section className="auth-card">
                <p className="label">
                    GET STARTED
                </p>

                <h2>Create account</h2>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        autoComplete="name"
                        disabled={loading}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        autoComplete="email"
                        disabled={loading}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        disabled={loading}
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value
                            )
                        }
                        autoComplete="new-password"
                        disabled={loading}
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
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <button
                    type="button"
                    className="register-link"
                    onClick={onBack}
                    disabled={loading}
                >
                    Already have an account? Sign in
                </button>
            </section>
        </main>
    );
}

export default Register;