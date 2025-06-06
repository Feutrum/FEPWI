import { Box, Button, Drawer, Toolbar, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function SidebarLeft() {
    const location = useLocation();
    const currentModule = location.pathname.split("/")[1];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: "auto", p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>{currentModule.toUpperCase()}</Typography>
                <Button fullWidth>Übersicht</Button>
                <Button fullWidth>Verwalten</Button>
            </Box>
        </Drawer>
    );
}