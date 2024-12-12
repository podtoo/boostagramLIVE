import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";

export default function Setup() {
  const [formData, setFormData] = useState({
    podcastName: "",
    nostrConnectAddress: "",
    adminUsername: "",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/save-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        setEncryptionKey(data.encryptionKey);
        setFormData({
          podcastName: "",
          nostrConnectAddress: "",
          adminUsername: "",
          adminPassword: "",
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{ marginTop: "2em", paddingBottom: "2em" }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Setup Your BoostagramLIVE
      </Typography>

      <Paper sx={{ marginTop: "1em", padding: "2em" }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Enter Your Setup Details
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
            <TextField
              label="Podcast Name"
              name="podcastName"
              value={formData.podcastName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Nostr Connect Address"
              name="nostrConnectAddress"
              value={formData.nostrConnectAddress}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Admin Username"
              name="adminUsername"
              value={formData.adminUsername}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Admin Password"
              name="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </form>

        {successMessage && (
          <Alert severity="success" sx={{ marginTop: "1em" }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ marginTop: "1em" }}>
            {errorMessage}
          </Alert>
        )}

        {encryptionKey && (
          <Box sx={{ marginTop: "2em" }}>
            <Typography variant="h6" component="h3">
              Your Generated Encryption Key
            </Typography>
            <Typography
              variant="body1"
              sx={{ backgroundColor: "#f5f5f5", padding: "1em", borderRadius: "5px" }}
            >
              {encryptionKey}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: "1em" }}>
              Please add this key to your <code>.env</code> file as: <span style={{color:'red'}}>(Failure to do so will BREAK this app.)</span>
            </Typography>
            <Typography
              variant="body1"
              sx={{ backgroundColor: "#f5f5f5", padding: "1em", borderRadius: "5px" }}
            >
              ENCRYPTION_KEY={encryptionKey}
            </Typography>
           
          </Box>
        )}
      </Paper>
    </Container>
  );
}
