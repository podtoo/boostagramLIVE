// pages/settings.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface Podcast {
  title: string;
  image: string;
  summary: string;
  guid: string;
  rssUrl: string;
}

export default function Settings() {
  const [currentTab, setCurrentTab] = useState(0);
  const [subwallets, setSubwallets] = useState<string[]>([]);
  const [walletLink, setWalletLink] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [newRssUrl, setNewRssUrl] = useState("");

  useEffect(() => {
    // Fetch existing podcasts and wallets when component mounts
    fetch("/api/settings/podcasts")
      .then((res) => res.json())
      .then(setPodcasts);

    fetch("/api/settings/subwallets")
      .then((res) => res.json())
      .then(setSubwallets);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddSubwallet = () => {
    const newWallet = `Subwallet ${subwallets.length + 1}`;
    setSubwallets([...subwallets, newWallet]);
  };

  const handleAddPodcast = async () => {
    if (!newRssUrl) return;

    try {
      const res = await fetch("/api/fetchPodcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssUrl: newRssUrl }),
      });

      const podcast = await res.json();
      setPodcasts([...podcasts, { ...podcast, rssUrl: newRssUrl }]);
      setNewRssUrl("");
    } catch (error) {
      console.error("Failed to fetch podcast:", error);
    }
  };

  const handleDeletePodcast = (index: number) => {
    const updatedPodcasts = podcasts.filter((_, i) => i !== index);
    setPodcasts(updatedPodcasts);
  };

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Tabs value={currentTab} onChange={handleTabChange} centered>
        <Tab label="Admin" />
        <Tab label="Wallets" />
        <Tab label="Podcasts" />
      </Tabs>

      {/* Admin Tab */}
      {currentTab === 0 && (
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6">Admin Settings</Typography>
            <Typography>This is the Admin section.</Typography>
          </CardContent>
        </Card>
      )}

      {/* Wallets Tab */}
      {currentTab === 1 && (
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6">Wallets</Typography>
            <Button variant="contained" onClick={handleAddSubwallet}>
              Add Subwallet
            </Button>
            <Box mt={2}>
              {subwallets.map((wallet, index) => (
                <Typography key={index}>{wallet}</Typography>
              ))}
            </Box>
            <Box mt={2}>
              <TextField
                label="Link Wallet to Podcast"
                value={walletLink}
                onChange={(e) => setWalletLink(e.target.value)}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Podcasts Tab */}
      {currentTab === 2 && (
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6">Podcasts</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label="RSS Feed URL"
                value={newRssUrl}
                onChange={(e) => setNewRssUrl(e.target.value)}
                fullWidth
              />
              <IconButton color="primary" onClick={handleAddPodcast}>
                <AddIcon />
              </IconButton>
            </Box>

            <Box mt={2}>
              {podcasts.map((podcast, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{podcast.title}</Typography>
                    <Typography>{podcast.summary}</Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <img
                        src={podcast.image}
                        alt={podcast.title}
                        width="100"
                        height="100"
                      />
                      <IconButton color="error" onClick={() => handleDeletePodcast(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
