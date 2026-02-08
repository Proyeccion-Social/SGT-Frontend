interface Props {
  password: string;
  onChange: (value: string) => void;
}

export default function LoginPasswordField({ password, onChange }: Props) {
  return (
    <div className="field">
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => onChange(e.target.value)}
      />

      <a href="#" className="forgot-password">
        ¿Olvidaste tu contraseña?
      </a>
    </div>
  );
}