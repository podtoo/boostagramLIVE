//SeanSecret
import { Container, Typography, Box } from "@mui/material";
import Link from 'next/link'
import Grid from "@mui/material/Grid2"; // Import Grid2 from the unstable package


export default function ThanksBody() {
  return (
    <Box sx={{ py: 5 }}> {/* Yellow Background */}
      <Container maxWidth="xl">
        <Grid container spacing={7} alignItems="center">
          {/* Left Side: Text Section */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Typography variant="h6" gutterBottom>
              This project could not happen without the support from the following people/businesses:
            </Typography>
            <Typography variant="body1">
                <Link href="https://podcastindex.org" alt="Podcast Index">Podcast Index</Link> - For keeping podcasting open.
            </Typography>
            <Typography variant="body1">
                <Link href="https://freesound.org/people/SeanSecret/" alt="Sean Secret">SeanSecret</Link> - For the free Lazer sound effects.
            </Typography>

            <Typography variant="h6" sx={{mt:"1em"}} gutterTop>
              This project uses tools from
            </Typography>
            
            <Typography variant="body1">
                <Link href="https://getalby.com" alt="Get Alby">Get Alby</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://mongodb.com" alt="Mongodb">Mongodb</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://firebase.google.com/" alt="Firebase">Firebase by Google</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://vercel.com" alt="Vercel">Vercel</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://mui.com" alt="MUI">MUI/MaterialUI</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://emotion.sh/" alt="MUI">Emotion CSS</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://axios-http.com/" alt="Axios-http">Axios-http</Link>
            </Typography>
            <Typography variant="body1">
                <Link href="https://github.com/js-cookie/js-cookie" alt="JS-Cookie">JS-Cookie</Link>
            </Typography>

            <Typography variant="body1" sx={{mt:"3em"}} gutterTop>
              This project was created by <Link href="https://PodToo.com/" alt="PodToo"><b>PodToo</b></Link> as part of our open source projects
            </Typography>
            
            
          </Grid>

          
        </Grid>
      </Container>
    </Box>
  );
}
