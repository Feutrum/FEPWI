/**
 * ProtectedRoute Component
 * Schützt Komponenten vor nicht-authentifizierten Benutzern
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * Wrapper-Komponente für geschützte Routen
 * @param {Object} props - Component Properties
 * @param {ReactNode} props.children - Zu schützende Komponente
 * @returns {ReactElement} Loading, Redirect oder geschützte Komponente
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Zeige Loading-Animation während der Authentifizierungs-Prüfung
    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // Leite nicht-authentifizierte Benutzer zum Login weiter
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Erlaube Zugang für authentifizierte Benutzer
    return children;
}