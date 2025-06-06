import { Box, Drawer, Toolbar } from "@mui/material";

export default function SidebarRight() {
    return (
        <Drawer
            variant="permanent"
            anchor="right"
            sx={{
                width: 80,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: 80,
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box",
                },
            }}
        >
            <Toolbar />
            <Box sx={{ flexGrow: 1 }} />
        </Drawer>
    );
}