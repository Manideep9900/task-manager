import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const endpoint = isLogin
        ? `${API_URL}/auth/login`
        : `${API_URL}/auth/register`;

      const body = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        onLogin(data.user);
      } else {
        setMessage("Registration successful. You can now login.");

        setIsLogin(true);
        setName("");
        setPassword("");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <p className="eyebrow">TASKYARD</p>

        <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>

        <p className="auth-subtitle">
          {isLogin
            ? "Login to manage your tasks."
            : "Create your TaskYard account."}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(event) => setPassword(event.target.value)}
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

          <button type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {message && <p className="auth-success">{message}</p>}

        {error && <p className="auth-error">{error}</p>}

        <button
          className="auth-switch"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setMessage("");
          }}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;