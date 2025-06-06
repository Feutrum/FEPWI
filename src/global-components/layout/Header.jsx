
/**
 * =================================================================
 * HEADER COMPONENT - ANWENDUNGS-KOPFZEILE MIT NAVIGATION
 * =================================================================
 *
 * Diese Komponente stellt die Hauptnavigation und Benutzerinformationen
 * in der oberen Leiste der Anwendung bereit. Sie implementiert
 * rollenbasierte Menüanzeige und Benutzerinteraktionen.
 *
 * ZWECK:
 * Zentrale Navigationsleiste die je nach Benutzerberechtigung
 * verschiedene Menüpunkte anzeigt und grundlegende Aktionen
 * wie Logout ermöglicht.
 *
 * FUNKTIONSWEISE:
 * - Zeigt verschiedene Modi basierend auf showFullHeader-Flag
 * - Filtert Menüpunkte nach Benutzerrollen
 * - Stellt Benutzerinformationen und Logout-Funktion bereit
 * - Passt sich an verschiedene Authentifizierungsstatus an
 *
 * ROLLENBASIERTE NAVIGATION:
 * Jeder Menüpunkt ist mit einer erforderlichen Rolle verknüpft.
 * Nur Benutzer mit entsprechenden Rollen sehen die jeweiligen
 * Navigationselemente.
 *
 * @version 1.0
 * =================================================================
 */

// ===== MATERIAL-UI IMPORTS =====
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { LogoutOutlined, AccountCircle } from "@mui/icons-material";

/**
 * HEADER NAVIGATION COMPONENT
 *
 * Hauptnavigationskomponente die verschiedene Anzeigemodi
 * unterstützt und rollenbasierte Menüfilterung implementiert.
 *
 * @param {Object} props - Component Properties
 * @param {boolean} props.showFullHeader - Vollständige Navigation anzeigen
 * @param {Object} props.user - Aktueller Benutzer mit Rollen
 * @param {Function} props.onLogout - Logout-Handler Funktion
 * @returns {ReactElement} Header-Komponente mit Navigation
 */
export default function Header({ showFullHeader, user, onLogout }) {

    /**
     * MENU ITEMS DEFINITION
     *
     * Definiert alle verfügbaren Navigationspunkte mit ihren
     * erforderlichen Benutzerrollen. Jeder Menüpunkt wird nur
     * angezeigt wenn der Benutzer die entsprechende Rolle besitzt.
     */
    const menuItems = [
        { label: "Feld- & Pflanzenmanagement", requiredRole: "farm-management" },
        { label: "Fuhrpark", requiredRole: "carpool" },
        { label: "Lager", requiredRole: "warehouse" },
        { label: "Personal", requiredRole: "hr" },
        { label: "Vertrieb", requiredRole: "sales" },
    ];

    /**
     * VISIBLE MENU ITEMS FUNCTION
     *
     * Filtert die verfügbaren Menüpunkte basierend auf den
     * Rollen des aktuell eingeloggten Benutzers.
     */
    const getVisibleMenuItems = () => {
        if (!user || !user.roles) return [];

        return menuItems.filter(item =>
            user.roles.includes(item.requiredRole)
        );
    };

    const visibleMenuItems = getVisibleMenuItems();

    return (
        <AppBar position="fixed" sx={{ zIndex: 1201 }}>
            <Toolbar>
                {/* Anwendungstitel */}
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    ERP Dashboard
                </Typography>

                {showFullHeader ? (
                    <>
                        {/* Navigation Buttons - nur sichtbare */}
                        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                            {visibleMenuItems.map((item, idx) => (
                                <Button key={idx} color="inherit">
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* User Info & Logout */}
                        {user && onLogout && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccountCircle />
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                    {user.email}
                                </Typography>
                                <Button
                                    color="inherit"
                                    onClick={onLogout}
                                    startIcon={<LogoutOutlined />}
                                    sx={{
                                        ml: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    Logout
                                </Button>
                            </Box>
                        )}
                    </>
                ) : (
                    // Minimaler Header für Login-Seite
                    <Button color="inherit">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

/**
 * =================================================================
 * VERWENDUNGSBEISPIELE:
 * =================================================================
 *
 * VOLLSTÄNDIGER HEADER (authentifizierter Benutzer):
 * ```jsx
 * <Header
 *   showFullHeader={true}
 *   user={{ email: 'user@example.com', roles: ['warehouse', 'sales'] }}
 *   onLogout={() => handleLogout()}
 * />
 * ```
 *
 * MINIMALER HEADER (Login-Seite):
 * ```jsx
 * <Header
 *   showFullHeader={false}
 *   user={null}
 *   onLogout={null}
 * />
 * ```
 *
 * =================================================================
 */