import { GetServerSideProps } from "next";
import { getWalletBalance } from "../../lib/walletFunctions/Balance";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import accessControl from "@/hoc/accessControl";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;

  // Extract cookies from the request headers
  const cookieHeader = req.headers.cookie || "";
  const boostagramUserCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("boostagram_user="));

  if (!boostagramUserCookie) {
    // If the cookie doesn't exist, redirect to /login
    return {
      redirect: {
        destination: "/login",
        permanent: false, // Temporary redirect
      },
    };
  }

  // If the cookie exists, parse the username
  const username = boostagramUserCookie.split("=")[1];

  // Fetch the wallet balance for the given username
  const walletInfo = await getWalletBalance(username);

  return {
    props: {
      walletInfo,
    },
  };
};

interface AdminDashboardProps {
  walletInfo: {
    totalBalance: number;
    transactions: any[];
  };
}

const AdminDashboard = ({ walletInfo }: AdminDashboardProps) => {
  const [currentHost, setCurrentHost] = useState("");

  useEffect(() => {
    // Get the current host (domain or IP with port) from the browser window
    setCurrentHost(window.location.host);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: "1em" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Boostagram admin dashboard.</p>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Card>
            <CardContent sx={{ borderRadius: 100 }}>
              <Typography variant="h6" component="div">
                Add this to your V4V block
              </Typography>

              <Typography variant="body2" component="div" sx={{ overflow: "auto", fontSize: "10px" }}>
                <pre>
                  <code>
                    {`<podcast:value type="lightning" method="keysend" suggested="0.00000005000">
  <podcast:valueRecipient name="My Podcast Name" type="lnaddress" address="boostagram@${currentHost}" split="100"/>
</podcast:value>`}
                  </code>
                </pre>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ mb: "1em" }}>
            <CardContent sx={{ borderRadius: 100 }}>
              <Typography variant="h6" component="div">
                Your balance: {walletInfo.totalBalance} sats
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ borderRadius: 100 }}>
              <Typography variant="h6" component="div">
                Boostagram Live App News
              </Typography>

              <Typography variant="body1" component="div" sx={{ overflow: "auto" }}>
                <ul>
                  <li>Version 0.0.1</li>
                  <ol>Currently in development</ol>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Container>
  );
};

export default accessControl(AdminDashboard);
