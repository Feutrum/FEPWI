import { Box, CssBaseline } from "@mui/material";
import Header from "../global-components/layout/Header";
import SidebarLeft from "../global-components/layout/SidebarLeft";
import SidebarRight from "../global-components/layout/SidebarRight";
import Footer from "../global-components/layout/Footer";


export default function MainLayout({ children, showFullHeader = false, user, onLogout }) {
    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <CssBaseline />

            <Header
                showFullHeader={showFullHeader}
                user={user}
                onLogout={onLogout}
            />
            <SidebarLeft />
            <SidebarRight />

            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, ml: `240px`, mr: "80px" }}
            >
                <Box sx={{ height: "64px" }} />
                {children}
            </Box>

            <Footer />
        </Box>
    );
}