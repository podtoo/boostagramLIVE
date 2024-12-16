import { useState, useEffect } from "react";
import { Box, Card, Chip, CardContent, Typography, CardMedia, Grid2 as Grid, Button, CardHeader, CardActions, CircularProgress } from "@mui/material";
import { CommentRounded } from '@mui/icons-material';

interface Podcast {
  title: string;
  image: string;
  summary: string;
  guid: string;
}


const CommentChip = ({ title }: { title: string }) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/core/frontend/comments?title=${encodeURIComponent(title)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setCount(data.count || 0);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCount(0);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [title]);

  return loading ? (
    <Chip
      icon={<CircularProgress size={16} />}
      label="Loading..."
      variant="filled"
      color="default"
      sx={{ pl: "0.2em" }}
    />
  ) : (
    <Chip
      icon={<CommentRounded />}
      label={count}
      variant="filled"
      color="primary"
      sx={{ pl: "0.2em" }}
    />
  );
};

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
                sx={{ width: 250, height: 250, objectFit: "cover" }}
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
                <CardActions>
                <CommentChip title={podcast.title} />
                </CardActions>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default MyPodcasts;
