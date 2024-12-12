import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import Cookies from "js-cookie";
import Logout from "../logout"; // Adjust the import path as per your project structure

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for a login cookie
    const userToken = Cookies.get("boostagram_user");
    setIsLoggedIn(!!userToken);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#FFF",
        color: "#000",
        padding: 1,
        gap: 2,
      }}
    >
      
      {isLoggedIn ? (
        <>
          <Button color="inherit" href="/admin">
            Dashboard
          </Button>
          <Button color="inherit" href="/admin/live">
            LIVE
          </Button>
          <Button color="inherit" href="/admin/settings">
            Settings
          </Button>
          {/* Use the Logout component here */}
          <Logout />
        </>
      ) : (
        <>
          <Button color="inherit" href="/">
            Home
          </Button>
         
          <Button color="inherit" href="/demo">
            Demo Payment
          </Button>
          <Button color="inherit" href="/admin">
            Admin Dashboard
          </Button>
          <Button color="inherit" href="#github">
            GitHub
          </Button>
        </>
      )}
    </Box>
  );
};

export default Navbar;
