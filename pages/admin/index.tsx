import { GetServerSideProps } from "next";
import { getWalletBalance } from "../../lib/walletFunctions/Balance";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Container, Grid2 } from "@mui/material";

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
  return (
    <Container maxWidth={'lg'} sx={{pt:'1em'}}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Boostagram admin dashboard.</p>
      <Grid2 container spacing={2}>
        <Grid2 size={8}>
        <Card>
          <CardContent sx={{borderRadius: 100}}>
          <Typography variant="h6" component="div">
             Add this to your V4V block
            </Typography>

            <Typography variant="body2" component="div" sx={{overflow:'auto', fontSize:'10px'}}>
            <pre>
                <code>
{`<podcast:value type="lightning" method="keysend" suggested="0.00000005000">
  <podcast:valueRecipient name="My Podcast Name" type="lnaddress" address="boostagram@localhost:3000" split="100"/>
</podcast:value>`}
                </code>
              </pre>
            </Typography>
          </CardContent>
        </Card>
        </Grid2>
        <Grid2 size={4}>
        <Card sx={{mb:'1em'}}>
          <CardContent sx={{borderRadius: 100}}>
            <Typography variant="h6" component="div">
              Your balance: {walletInfo.totalBalance} sats
            </Typography>
          </CardContent>
        </Card>


        <Card>
          <CardContent sx={{borderRadius: 100}}>
            <Typography variant="h6" component="div">
             Boostagram Live App News
            </Typography>

            <Typography variant="body1" component="div" sx={{overflow:'auto'}}>
            <ul>
            <li>Version 0.0.1</li>
            <ol>Currently in development</ol>
            </ul>
            </Typography>
          </CardContent>
        </Card>
        </Grid2>
        
      </Grid2>


      
      {/* You can also display or handle the transactions as needed */}
    </Container>
  );
};

export default AdminDashboard;
