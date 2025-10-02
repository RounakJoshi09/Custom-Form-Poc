import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

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
        <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
          The form builder will be implemented step by step.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link href="/builder" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">
              Open Form Builder
            </Button>
          </Link>
          <Link href="/forms" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" size="large">
              View Saved Forms
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
