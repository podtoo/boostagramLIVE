import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const LnurlForm = () => {
  const [formData, setFormData] = useState({
    appName: '',
    appIcon: '',
    username: '',
    userProfileLink: '',
    userProfileImage: '',
    amount: '',
    comment: '',
    episodeGUID: '',
  });
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boostagramId, setBoostagramId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPaymentSuccess(false);
    setExpired(false);

    try {
      const params = new URLSearchParams(formData).toString();
      const response = await axios.get(
        `/.well-known/lnurlp/mywallet/callback?${params}`
      );

      const prValue = response.data.pr;
      setQrValue(prValue);
    } catch (err) {
      setError('Error fetching QR code data.');
    } finally {
      setLoading(false);
    }
  };

  const generateCurlCommand = () => {
    const params = new URLSearchParams(formData).toString();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';
    return `curl "${baseUrl}/.well-known/lnurlp/boostagram/callback?${params}"`;
  };

  //Check Invoice Paid or not.
  useEffect(() => {
    let interval: NodeJS.Timeout;
  
    if (qrValue && !paymentSuccess) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/core/demoChecker?invoice=${qrValue}`);
          
          if (response.data.success === true) {
            setPaymentSuccess(true);
            setBoostagramId(response.data.boostagramId);
            clearInterval(interval);
          } else if (response.data.error === true && response.data.message === 'invoice expired') {
            setQrValue('');
            setExpired(true);
            clearInterval(interval);
          } else if (response.data.success === false && response.data.pending === true) {
            console.log('Payment is still pending...');
          } else {
            console.warn('Unexpected response:', response.data);
          }
        } catch (err) {
          if (err.response && err.response.status === 500) {
            console.error('Server error occurred:', err.response.data);
            setError('A server error occurred while checking the payment status. Please try again later.');
            clearInterval(interval);
          } else {
            console.error('Error checking invoice status:', err);
            setError('An unexpected error occurred. Please try again.');
            clearInterval(interval);
          }
        }
      }, 1000);
    }
  
    return () => clearInterval(interval);
  }, [qrValue, paymentSuccess]);
  

  return (
    <Container maxWidth="lg">
      {!paymentSuccess && !expired && (
        <>
          <Typography variant="h4" gutterBottom>
            LNURL Payment Request to @ boostagram user
          </Typography>
          <Typography variant="body2">
            If you pay the QR code generated on this page, you will be paying the server that this is installed in.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="App Name"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              //required
            />
            <TextField
              label="App Icon (jpeg, png full URL)"
              name="appIcon"
              value={formData.appIcon}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              //required
            />
            <TextField
              label="User Profile Image (full URL of user Image jpeg, png)"
              name="userProfileImage"
              value={formData.userProfileImage}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="User Profile Link (full URL of user profile)"
              name="userProfileLink"
              value={formData.userProfileLink}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Episode GUID"
              name="episodeGUID"
              value={formData.episodeGUID}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? 'Generating...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </>
      )}

      {error && <Typography color="error" mt={2}>{error}</Typography>}

      {qrValue && (
        <>
          <Box mt={4} textAlign="center">
            <Typography variant="h6">Your QR Code</Typography>
            <QRCodeSVG value={qrValue} size={256} />
          </Box>

          <Box mt={4}>
            <Typography variant="h6">cURL Example</Typography>
            <Paper
              elevation={3}
              sx={{
                padding: '10px',
                backgroundColor: '#f5f5f5',
                overflowX: 'auto',
                maxWidth: '100%',
                whiteSpace: 'pre-wrap',
              }}
            >
              <Typography component="pre" sx={{ fontFamily: 'monospace', margin: 0 }}>
                {generateCurlCommand()}
              </Typography>
            </Paper>
          </Box>
        </>
      )}

      {paymentSuccess && (
        <Box mt={4} textAlign="center">
          <Typography variant="h5" color="success.main">
            Payment Successful! Boostagram ID: {boostagramId}
          </Typography>
        </Box>
      )}

      {expired && (
        <Box mt={4} textAlign="center">
          <Typography variant="h5" color="error.main">
            Invoice Expired. Please regenerate the QR code.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default LnurlForm;