import { Container, Typography, Box } from "@mui/material";
import LnurlForm from "@/components/system/demoSend";

export default function BoostagramBody() {
  return (
    <Box sx={{ py: 5 }}> {/* Yellow Background */}
      <Container maxWidth="xl">
        <LnurlForm />
      </Container>
    </Box>
  );
}
