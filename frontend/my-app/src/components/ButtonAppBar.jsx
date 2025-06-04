
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Link, Links } from 'react-router-dom';



export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
         
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Super tolles Landwirtsystem 
          </Typography>
          <Stack direction='row' spacing={2}>
            <Button color="inherit">
        
              </Button>
            
            <Button color="inherit" component={Link}to="/Felder">
              Felder
              </Button>
            
            <Button color="inherit" component={Link}to="/Geräte">
              Geräte
              </Button>
            
            <Button color="inherit" component={Link}to="/Lager">
              Lager
              </Button>
            
            <Button color="inherit" component={Link}to="/Vertrieb">
              Vertrieb
              </Button>
            
            <Button color="inherit" component={Link}to="/Personal">
              Personal
              </Button>
          </Stack>
          
        </Toolbar>
      </AppBar>
    </Box>
  );
}