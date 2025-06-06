import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <MainLayout
            showFullHeader={true}
            user={user}
            onLogout={logout}
        >
            <h2>Willkommen im Dashboard</h2>
            <p>Dies ist eine Testansicht mit dem kompletten Layout.</p>
        </MainLayout>
    );
}