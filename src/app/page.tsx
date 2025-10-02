import { Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Custom Forms - POC
        </Typography>
        <Typography variant="h6" color="text.secondary">
          A dynamic form builder with drag and drop interface
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          The form builder will be implemented step by step.
        </Typography>
      </Box>
    </Container>
  );
}
