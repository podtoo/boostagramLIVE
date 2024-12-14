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
import accessControl from "@/hoc/accessControl";

interface Podcast {
  title: string;
  image: string;
  summary: string;
  guid: string;
  rssUrl: string;
}

function Settings() {
  const [currentTab, setCurrentTab] = useState(0);
  const [subwallets, setSubwallets] = useState<{ name: string; podcastGuid: string; submitted: boolean }[]>([]);
  const [walletLink, setWalletLink] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [newRssUrl, setNewRssUrl] = useState("");

  useEffect(() => {
    // Fetch existing podcasts and wallets when component mounts
    fetch("/api/system/podcast")
      .then((res) => res.json())
      .then(setPodcasts);

    fetch("/api/system/walletmanagment/getsubwallets")
      .then((res) => res.json())
      .then((data) => {
        const updatedSubwallets = data.map((wallet: { name: string; podcastGuid: string }) => ({
          ...wallet,
          submitted: true, // Mark all loaded wallets as submitted
        }));
        setSubwallets(updatedSubwallets);
      });
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddSubwallet = () => {
    setSubwallets([...subwallets, { name: "", podcastGuid: "", submitted: false }]);
  };

  const handleSubwalletNameChange = (index: number, value: string) => {
    const updatedSubwallets = [...subwallets];
    updatedSubwallets[index].name = value;
    setSubwallets(updatedSubwallets);
  };

  const handleLinkToPodcast = async (index: number, podcastGuid: string) => {
    const updatedSubwallets = [...subwallets];
    updatedSubwallets[index].podcastGuid = podcastGuid;
  
    // Send the update to the server
    const subwallet = updatedSubwallets[index];
    if (!subwallet.name || subwallet.name.trim() === "") {
      alert("Please enter a subwallet name before linking to a podcast.");
      return;
    }


    try {
      const response = await fetch("/api/system/walletmanagment/updatesubwallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: subwallet.name,
          podcastGuid: subwallet.podcastGuid,
          domain: window.location.hostname,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update subwallet");
      }
  
      // Mark as submitted
      updatedSubwallets[index].submitted = true;
      setSubwallets(updatedSubwallets);
      console.log("Subwallet updated successfully");
    } catch (error) {
      console.error("Error updating subwallet:", error);
    }
  };
  
  

  const handleDeleteSubwallet = (index: number) => {
    const updatedSubwallets = subwallets.filter((_, i) => i !== index);
    setSubwallets(updatedSubwallets);
  };

  
  const handleAddPodcast = async () => {
    if (!newRssUrl) return;

    try {
      const res = await fetch("/api/system/podcast/savePodcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssUrl: newRssUrl }),
      });

      const podcast = await res.json();
      console.log(JSON.stringify(podcast));
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
        <Tab label="My Podcasts" />
        <Tab label="Wallets" />
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
      {currentTab === 2 && (
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6">Wallets</Typography>

            {/* Add Subwallet Button */}
            <Button variant="contained" onClick={handleAddSubwallet} sx={{ mb: 2 }}>
              Add Subwallet
            </Button>

            {/* Subwallet Input and Dropdown for Linking Podcast */}
            <Box mt={2}>
              {subwallets.map((wallet, index) => (
                <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                  <TextField
                    label="Subwallet Name"
                    value={wallet.name}
                    onChange={(e) => handleSubwalletNameChange(index, e.target.value)}
                    fullWidth
                    disabled={wallet.submitted} // Disable if the wallet has been submitted
                    InputProps={{
                      endAdornment: (
                        <Typography variant="body2" sx={{ color: "grey.600", ml: 1 }}>
                          @{window.location.hostname}
                        </Typography>
                      ),
                    }}
                  />

                  <TextField
                    select
                    label="Link to Podcast"
                    value={wallet.podcastGuid}
                    onChange={(e) => handleLinkToPodcast(index, e.target.value)}
                    SelectProps={{ native: true }}
                    fullWidth
                  >
                    <option value="">Link to Podcast</option>
                    {podcasts.map((podcast) => {
                      // Check if the podcast is already selected by another subwallet
                      const isSelected = subwallets.some(
                        (sw, i) => sw.podcastGuid === podcast.guid && i !== index
                      );

                      return (
                        <option key={podcast.guid} value={podcast.guid} disabled={isSelected}>
                          {podcast.title}
                        </option>
                      );
                    })}
                  </TextField>


                  <IconButton color="error" onClick={() => handleDeleteSubwallet(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}



      {/* Podcasts Tab */}
      {currentTab === 1 && (
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


export default accessControl(Settings);