import { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, CardMedia, Grid2 as Grid, Button, CardHeader } from "@mui/material";

interface Podcast {
  title: string;
  image: string;
  summary: string;
  guid: string;
}

function MyPodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

  useEffect(() => {
    document.body.style.backgroundColor = "#eee";

    fetch("/api/system/podcast")
      .then((res) => res.json())
      .then(setPodcasts);
  }, []);

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Grid container spacing={2}>
        {podcasts.map((podcast, index) => (
          <Grid key={index} size={{ xs: 12, sm: 12, md: 6 }}>
            <Card sx={{ display: "flex", alignItems: "stretch", height: "100%" }}>
              <CardMedia
                component="img"
                sx={{ width: 200, height: 200, objectFit: "cover" }}
                image={podcast.image}
                alt={podcast.title}
              />
              <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <CardHeader
                  title={podcast.title}
                  titleTypographyProps={{ variant: "h6" }}
                  action={
                    <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{mr:'1em'}}
                      onClick={() => window.location.href = `/podcast/${podcast.guid}/ratings`}
                    >
                        Ratings
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => window.location.href = `/podcast/${podcast.guid}`}
                    >
                        Episodes
                    </Button>
                    </>
                  }
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {podcast.summary}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default MyPodcasts;
