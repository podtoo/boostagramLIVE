import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import Navbar from './navbar';
import BoostagramLogo from '../../public/images/boostagramlogo.svg'; // Import the SVG file
import Image from 'next/image';

const Header = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#FFF',
        boxShadow: 'none', // Removes shadow
        margin: 0, // No margin
        padding: 0, // No padding
        overflow: 'hidden', // Prevents any accidental overflow
      }}
    >
      <Toolbar
        disableGutters // Disables default padding
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0, // No padding inside the toolbar
          margin: 0, // No margin inside the toolbar
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
          <Image
            src={BoostagramLogo} // Use imported image
            alt="Boostagram Logo"
            width={120} // Set logo width
            height={40} // Set logo height
            priority // Ensure quick loading
          />
        </Box>

        {/* Include Navbar */}
        <Box sx={{ paddingRight: '1rem' }}>
          <Navbar />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
