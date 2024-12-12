import { Container, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Import Grid2 from the unstable package
import Image from "next/image";
import largeBoost from "../public/images/largeBoostimage_home.svg"; // Import the SVG file

export default function BoostagramBody() {
  return (
    <Box sx={{ py: 5 }}> {/* Yellow Background */}
      <Container maxWidth="xl">
        <Grid container spacing={7} alignItems="center">
          {/* Left Side: Text Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h2" gutterBottom>
              Grow your community
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to Boostagram live, an open-source tool that allows you
              to connect with your fans via the power of L402 & SecureRSS.
            </Typography>
            <Typography variant="h6" gutterBottom>
              Features Include
            </Typography>
            <ul>
              <Typography component="li">Text Boost Messages</Typography>
              <Typography component="li">Voice Boost Messages</Typography>
              <Typography component="li">Video Boost Messages</Typography>
              <Typography component="li">
                Audio Alerts for every boost that comes in
              </Typography>
            </ul>
          </Grid>

          {/* Right Side: Image Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Image
              src={largeBoost} // Use imported image
              alt="Boostagram Logo"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
              priority // Ensure quick loading
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
