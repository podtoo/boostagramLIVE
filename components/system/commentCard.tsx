import React, { useState, useEffect } from "react";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";

interface CommentCardProps {
  avatarUrl?: string;
  username?: string;
  userProfileLink?: string;
  userProfileImage?: string;
  boostAmount?: string;
  commentText?: string;
  appImageUrl?: string;
  appName?: string;
  boostType?: string;
  timestamp?: number; // Accept timestamp as Unix time in seconds
}

// Function to convert timestamp to a "time ago" format
const getTimeAgo = (timestamp: number): string => {
  const now = new Date();
  const past = new Date(timestamp * 1000);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const adjustedSeconds = Math.max(diffInSeconds, 0);

  if (adjustedSeconds < 60) {
    return `Less than 1min ago`;
  }

  const diffInMinutes = Math.floor(adjustedSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}H ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const CommentCard = ({
  avatarUrl,
  username = "Anonymous",
  userProfileLink,
  boostAmount = "",
  commentText = "",
  appImageUrl = "/images/podcastplayers/unknown-default-app.jpg",
  appName = "Unknown App",
  boostType = "",
  timestamp = Math.floor(Date.now() / 1000)
}: CommentCardProps) => {
  const [timeAgo, setTimeAgo] = useState(getTimeAgo(timestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(timestamp));
    }, 60000);

    // Initial update
    setTimeAgo(getTimeAgo(timestamp));

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <Card key={Math.random().toString(36).substr(2, 9)} sx={{ mb: "1em" }}>
      <CardHeader
        avatar={
          avatarUrl ? (
            <Avatar src={avatarUrl} alt="Profile Image" />
          ) : (
            <Avatar>{username && username.length > 0 ? username.charAt(0).toUpperCase() : "A"}</Avatar>
          )
        }
        title={`${username} - ${boostAmount} Sats`}
        titleTypographyProps={{
          sx: { fontSize: "20px", fontWeight: "bold" },
        }}
        action={
          userProfileLink && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                "&:hover": { backgroundColor: "#999" },
                display: "flex",
                alignItems: "center",
                padding: "0.5em 1em",
                textTransform: "none",
              }}
              href={userProfileLink}
              target="_blank"
            >
              <img
                src={appImageUrl}
                alt={appName}
                width={28}
                height={28}
                style={{ borderRadius: "20%", marginRight: "0.5em" }}
              />
              View {appName} Profile
            </Button>
          )
        }
        sx={{ mb: "0em", pb: "1em", borderBottom: "1px solid #eee" }}
      />
      <CardContent sx={{ borderRadius: 100 }}>
        <Typography variant="body1" component="div">
          {commentText}
        </Typography>
      </CardContent>
      <CardActions>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={appImageUrl}
            alt={appName}
            width={28}
            height={28}
            style={{ borderRadius: "20%", marginRight: ".5em" }}
          />
          {appName} <span style={{ marginLeft: "0.5em" }}>- {timeAgo}</span>
        </Box>
      </CardActions>
    </Card>
  );
};

export default CommentCard;
