import { useState } from "react";
import LoginPasswordField from "./LoginPasswordField";
import "../styles/auth.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    console.log("Login:", email, password);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="nombre@udistrital.edu.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {showPassword && (
        <LoginPasswordField
          password={password}
          onChange={setPassword}
        />
      )}

      <button type="submit">Continuar</button>
    </form>
  );
}