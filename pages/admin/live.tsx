import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid2,
  List,
  ListItem,
  ListItemText,
  Switch,
} from "@mui/material";
import CommentCard from "@/components/system/commentCard";
import { getWalletBalance } from "../../lib/walletFunctions/Balance";
import accessControl from "@/hoc/accessControl";

// Sound effect URLs from the public folder
const boostSounds = {
  "First Time Booster": "/sounds/BoostagramSF/FirstTimeBoost.mp3",
  "1000 sats Booster": "/sounds/-pews-and-rikochets/440664__seansecret__heavy-anti-air-blaster.mp3",
  "User Boosted 50x": "/sounds/BoostagramSF/LevelUp4.mp3",
  "User Boosted 1M sats": "/sounds/BoostagramSF/1MsatLevel.mp3",
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;

  // Extract cookies from the request headers
  const cookieHeader = req.headers.cookie || "";
  const boostagramUserCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("boostagram_user="));

  if (!boostagramUserCookie) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const username = boostagramUserCookie.split("=")[1];
  const walletInfo = await getWalletBalance(username);

  return {
    props: {
      walletInfo,
    },
  };
};

interface LiveDashboardProps {
  walletInfo: {
    totalBalance: number;
    transactions: any[];
  };
}

interface Comment {
  id?: string | number;
  _id?: string;
  username?: string;
  userProfileLink?: string;
  userProfileImage?: string;
  amount: string;
  comment: string;
  appImageUrl?: string;
  appName?: string;
  settled_at: number;
  boostType: string;
}

const LiveDashboard = ({ walletInfo }: LiveDashboardProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [lastId, setLastId] = useState<string | null>(null); // To track the most recent _id

  const [firstTimeBooster, setFirstTimeBooster] = useState(true);
  const [thousandSatsBooster, setThousandSatsBooster] = useState(false);
  const [fiftyXBooster, setFiftyXBooster] = useState(true);
  const [oneMillionBooster, setOneMillionBooster] = useState(true);


  // Standalone fetchComments function
  const fetchComments = async (currentLastId = lastId) => {
    try {
      const url = currentLastId
        ? `/api/core/liveComments?lastid=${currentLastId}`
        : `/api/core/liveComments`;
  
      const response = await axios.get(url, {
        validateStatus: (status) => status < 500, // Treat 4xx statuses as successful responses
      });
  
      if (response.status >= 400 && response.status < 500) {
        console.warn(`Client error: ${response.status} - ${response.statusText}`);
        // Handle the 4xx error gracefully without crashing
        setTimeout(() => fetchComments(currentLastId), 2000);
        return;
      }
  
      if (response.data && response.data.length > 0) {
        setComments((prevComments) => [...prevComments, ...response.data]);
        playHighestBoostSound(response.data);
        const newLastId = response.data[response.data.length - 1]._id;
        setLastId(String(newLastId));
  
        // Schedule the next fetch with the new lastId
        setTimeout(() => fetchComments(String(newLastId)), 10000);
      } else {
        // No new comments; schedule the next fetch with the same lastId
        setTimeout(() => fetchComments(currentLastId), 10000);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Retry after 10 seconds even if there was an error
      setTimeout(() => fetchComments(currentLastId), 10000);
    }
  };
  

// Monitor lastId changes and log when it's updated
useEffect(() => {
  if (lastId) {
    console.log('Updated lastId:', lastId);
  
  }
}, [lastId]);

useEffect(() => {
  fetchComments();
}, []);

  // Function to play the highest boost sound based on the switch state
  const playHighestBoostSound = React.useCallback(
    (comments: Comment[]) => {
      const boostPriority = [
        "User Boosted 1M sats",
        "User Boosted 50x",
        "1000 sats Booster",
        "First Time Booster",
      ];
  
      const boostSwitches = {
        "First Time Booster": firstTimeBooster,
        "1000 sats Booster": thousandSatsBooster,
        "User Boosted 50x": fiftyXBooster,
        "User Boosted 1M sats": oneMillionBooster,
      };
  
      // Filter comments with valid boostType
      const validBoosts = comments.filter((comment) => comment.boostType);
  
      // Find the highest-priority boost that is present in comments and has its switch enabled
      const boostToPlay = boostPriority.find(
        (boost) => validBoosts.some((comment) => comment.boostType === boost) && boostSwitches[boost]
      );
  
      // Play the sound if a valid boost type is found
      if (boostToPlay) {
        console.log(`Playing sound for: ${boostToPlay}`);
        const audio = new Audio(boostSounds[boostToPlay]);
        audio.play().catch((error) => console.error("Audio playback error:", error));
      }
    },
    [firstTimeBooster, thousandSatsBooster, fiftyXBooster, oneMillionBooster] // Dependencies to track switch states
  );
  

  return (
    <Container maxWidth="lg" sx={{ pt: "1em" }}>
      <h1>Live Dashboard</h1>
      <Grid2 container spacing={2}>
        <Grid2 size={8}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id || comment._id?.toString()}
                avatarUrl={comment.userProfileImage}
                username={comment.username}
                userProfileLink={comment.userProfileLink}
                boostAmount={comment.amount}
                commentText={comment.comment}
                boostType={comment.boostType}
                appImageUrl={comment.appImageUrl}
                appName={comment.appName}
                timestamp={comment.settled_at}
              />
            ))
          ) : (
            <Typography variant="body1">No boosts received yet.</Typography>
          )}
        </Grid2>

        <Grid2 size={4}>
          {/* Wallet Balance Card */}
          <Card sx={{ mb: "1em" }}>
            <CardContent sx={{ borderRadius: 100 }}>
              <Typography variant="h6" component="div">
                Your balance: {walletInfo.totalBalance} sats
              </Typography>
            </CardContent>
          </Card>

          {/* Boostagram Sound Effects Switches */}
          <Card>
            <CardContent sx={{ borderRadius: 100 }}>
              <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                Boostagram Live Sound Effects
              </Typography>
              <List disablePadding>
                <ListItem secondaryAction={<Switch checked={firstTimeBooster} onChange={(e) => setFirstTimeBooster(e.target.checked)} color="primary" />}>
                  <ListItemText primary="First Time Booster" />
                </ListItem>
                <ListItem secondaryAction={<Switch checked={thousandSatsBooster} onChange={(e) => setThousandSatsBooster(e.target.checked)} color="primary" />}>
                  <ListItemText primary="1000 sats Booster" />
                </ListItem>
                <ListItem secondaryAction={<Switch checked={fiftyXBooster} onChange={(e) => setFiftyXBooster(e.target.checked)} color="primary" />}>
                  <ListItemText primary="User Boosted 50x" />
                </ListItem>
                <ListItem secondaryAction={<Switch checked={oneMillionBooster} onChange={(e) => setOneMillionBooster(e.target.checked)} color="primary" />}>
                  <ListItemText primary="User Boosted 1M sats" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
  );
};


export default accessControl(LiveDashboard);