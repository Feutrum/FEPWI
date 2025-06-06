// src/global-components/layout/Footer.jsx
import { Box, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                width: "100%",
                textAlign: "center",
                p: 1,
                backgroundColor: "#e0e0e0",
                position: "fixed",
                bottom: 0,
                left: 0,
                zIndex: 1201
            }}
        >
            <Typography variant="body2">
                © 2025 ERP-System | <a href="/impressum">Impressum</a>
            </Typography>
        </Box>
    );
}