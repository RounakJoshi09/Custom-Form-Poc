import { Container, Typography, Box, Alert, Button } from '@mui/material';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';
import { FormPreview } from '@/components/PreviewPanel';
import { loadForm } from '@/lib/persistence';
import { FormSchema } from '@/lib/schema';

interface FormRenderPageProps {
  params: {
    id: string;
  };
}

// This is a server component that fetches the form data
async function getFormData(
  id: string
): Promise<{ schema?: FormSchema; error?: string }> {
  try {
    // In a server component, we need to construct the full URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/forms/${id}`, {
      // Important: Don't cache in development
      cache: 'no-store',
    });

    if (!response.ok) {
      return { error: 'Form not found' };
    }

    const schema = await response.json();
    return { schema };
  } catch (error) {
    return { error: 'Failed to load form' };
  }
}

export default async function FormRenderPage({ params }: FormRenderPageProps) {
  const { id } = params;
  const { schema, error } = await getFormData(id);

  if (error || !schema) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Form not found'}
          </Alert>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button startIcon={<ArrowBack />}>Back to Home</Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button startIcon={<ArrowBack />} size="small">
              Back
            </Button>
          </Link>
          <Typography variant="h4" component="h1">
            {schema.metadata.name}
          </Typography>
        </Box>

        {schema.metadata.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {schema.metadata.description}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(schema.metadata.updatedAt).toLocaleString()}
        </Typography>
      </Box>

      {/* Form Content */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 4,
        }}
      >
        <FormPreview schema={schema} />
      </Box>
    </Container>
  );
}

// Optional: Generate metadata for the page
export async function generateMetadata({ params }: FormRenderPageProps) {
  const { id } = params;
  const { schema } = await getFormData(id);

  return {
    title: schema
      ? `${schema.metadata.name} | Custom Forms`
      : 'Form Not Found | Custom Forms',
    description:
      schema?.metadata.description || 'Custom form built with the form builder',
  };
}
