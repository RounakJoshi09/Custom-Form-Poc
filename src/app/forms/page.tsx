import { Container, Typography, Box, Alert, Button, Card, CardContent, Grid } from '@mui/material';
import Link from 'next/link';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { SavedFormSummary } from '@/lib/persistence';

// This is a server component that fetches the forms list
async function getFormsData(): Promise<{ forms?: SavedFormSummary[]; error?: string }> {
  try {
    // In a server component, we need to construct the full URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/forms`, {
      // Important: Don't cache in development
      cache: 'no-store'
    });

    if (!response.ok) {
      return { error: 'Failed to fetch forms' };
    }

    const forms = await response.json();
    return { forms };
  } catch (error) {
    return { error: 'Failed to load forms' };
  }
}

export default async function FormsListPage() {
  const { forms, error } = await getFormsData();

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button>Back to Home</Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Saved Forms
        </Typography>
        <Link href="/builder" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create New Form
          </Button>
        </Link>
      </Box>

      {/* Forms Grid */}
      {!forms || forms.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first form to get started
          </Typography>
          <Link href="/builder" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large" startIcon={<AddIcon />}>
              Create Form
            </Button>
          </Link>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {form.name}
                  </Typography>
                  {form.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2 }}
                    >
                      {form.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(form.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Link href={`/forms/${form.id}`} style={{ textDecoration: 'none' }}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<ViewIcon />}
                    >
                      View Form
                    </Button>
                  </Link>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export const metadata = {
  title: 'Saved Forms | Custom Forms',
  description: 'Browse and access your saved forms',
};