/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Link from 'next/link';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  Assessment as SubmissionsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { SavedFormSummary } from '@/lib/persistence';
import React from 'react';

const GridItem = Grid as unknown as React.ComponentType<any>;

// Form card component with actions menu
function FormCard({ form }: { form: SavedFormSummary }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ flex: 1 }}>
            {form.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClick}
            aria-label="more actions"
          >
            <MoreIcon />
          </IconButton>
        </Box>

        {form.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {form.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={new Date(form.updatedAt).toLocaleDateString()}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Link
          href={`/forms/${form.id}`}
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ViewIcon />}
          >
            Fill Form
          </Button>
        </Link>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component={Link} href={`/forms/${form.id}`} onClick={handleClose}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Fill Form</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href={`/forms/${form.id}/submissions`} onClick={handleClose}>
          <ListItemIcon>
            <SubmissionsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Submissions</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href={`/builder?id=${form.id}`} onClick={handleClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Form</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default function FormsListPage() {
  const [forms, setForms] = React.useState<SavedFormSummary[] | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch('/api/forms');
        if (!response.ok) {
          setError('Failed to fetch forms');
          return;
        }
        const formsData = await response.json();
        setForms(formsData);
      } catch (err) {
        setError('Failed to load forms');
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Loading forms...</Typography>
        </Box>
      </Container>
    );
  }

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
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
            <GridItem xs={12} sm={6} md={4} key={form.id}>
              <FormCard form={form} />
            </GridItem>
          ))}
        </Grid>
      )}
    </Container>
  );
}

