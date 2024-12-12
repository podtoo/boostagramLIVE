import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

interface VersionInfo {
  app_name: string;
  version: string;
  releaseDate: string;
}

const Footer = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch("/api/version");
        const data = await response.json();
        setVersionInfo(data);
      } catch (error) {
        console.error("Error fetching version info:", error);
      }
    };

    fetchVersionInfo();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "background.default",
        padding: "8px 16px",
        textAlign: "left",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {versionInfo ? (
        <Typography variant="body2" color="text.secondary">
          {versionInfo.app_name} - v{versionInfo.version} (Released on {versionInfo.releaseDate})
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Loading version info...
        </Typography>
      )}
    </Box>
  );
};

export default Footer;
