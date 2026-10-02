import { useEffect, useState } from "react";
import Login from "./components/Login";
import { getMe } from "./api/auth";
import { getToken, removeToken } from "./storage/auth";

function App() {
  const [authenticated, setAuthenticated] =
    useState<boolean | null>(null);

  const [user, setUser] = useState<{
    email: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();

      if (!token) {
        setAuthenticated(false);
        return;
      }

      try {
        const currentUser = await getMe();

        setUser(currentUser);
        setAuthenticated(true);
      } catch {
        await removeToken();
        setAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  if (authenticated === null) {
    return (
      <main className="app">
        <p>Loading...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <Login
        onLogin={() => setAuthenticated(true)}
      />
    );
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Tody</h1>

        <span className="date">
          Know what to do.
        </span>
      </header>

      <section className="next">
        <p className="label">
          WHAT'S NEXT
        </p>

        <h2>
          Welcome{user?.name ? `, ${user.name}` : ""}.
        </h2>

        <p>
          Authentication is working.
        </p>
      </section>
    </main>
  );
}

export default App;