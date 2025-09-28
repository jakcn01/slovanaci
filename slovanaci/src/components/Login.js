import React, { useState, useContext, useEffect } from "react";
import { signIn, signUp } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        alert("Zkontroluj si email pro ověření!");
      } else {
        await signIn(email, password);
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isSignUp ? "Registrace" : "Přihlášení"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Načítá se..." : isSignUp ? "Registrace" : "Přihlášení"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        {isSignUp ? "Už jsi Slovaňák?" : "Ještě nejsi Slovaňák?"}{" "}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          {isSignUp ? "Přihlásit se" : "Zaregistrovat se"}
        </button>
      </p>
    </div>
  );
};

export default Login;
