import "./ChangePasswordForm.css";
import { useAuthStore } from "@/store/authStore";

export default function ChangePasswordGreeting() {
    const name = useAuthStore((s) => s.user?.name.split(" ")[0] ?? "");

    return (
        <div className="change-password-greeting">
            <h4 className="greeting-text">Hola</h4>
            <h1 className="greeting-name">{name}</h1>
        </div>
    );
}
