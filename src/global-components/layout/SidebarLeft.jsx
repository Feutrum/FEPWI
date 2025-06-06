
import { Box, Button, Drawer, Toolbar, Typography } from "@mui/material";
import { useState, useEffect } from "react";

const drawerWidth = 240;

export default function SidebarLeft({ activeModule, onPageChange }) {
    const [modulePages, setModulePages] = useState([]);
    const [activePage, setActivePage] = useState(null);

    // Dynamisch Module Config laden basierend auf activeModule prop
    useEffect(() => {
        const loadModuleConfig = async () => {
            if (!activeModule) {
                setModulePages([]);
                return;
            }

            try {
                const { moduleConfig } = await import(`../../modules/${activeModule}/module-config.js`);
                setModulePages(moduleConfig.pages || []);

                // Erste Page als default setzen
                if (moduleConfig.pages?.length > 0) {
                    setActivePage(moduleConfig.defaultPage || moduleConfig.pages[0].component);
                }
            } catch (error) {
                console.warn(`Keine module-config.js für ${activeModule} gefunden`);
                setModulePages([]);
            }
        };

        loadModuleConfig();
    }, [activeModule]);

    const handlePageChange = (pageComponent) => {
        setActivePage(pageComponent);
        onPageChange?.(pageComponent);  // Callback zum Parent (Dashboard)
    };

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
                <Typography variant="subtitle1" gutterBottom>
                    {activeModule ? activeModule.toUpperCase() : 'KEIN MODUL AKTIV'}
                </Typography>

                {/* Dynamische Page-Buttons */}
                {modulePages.map((page) => (
                    <Button
                        key={page.component}
                        fullWidth
                        variant={activePage === page.component ? "contained" : "text"}
                        onClick={() => handlePageChange(page.component)}
                        sx={{ mb: 1, justifyContent: 'flex-start' }}
                    >
                        {page.name}
                    </Button>
                ))}
            </Box>
        </Drawer>
    );
}