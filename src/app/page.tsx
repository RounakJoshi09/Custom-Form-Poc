'use client';
import { Container, Typography, Box, Button, Grid, Card, CardContent, useTheme } from '@mui/material';
import Link from 'next/link';
import {
  DynamicForm as FormIcon,
  Visibility as PreviewIcon,
  Storage as SaveIcon,
  Settings as ConfigIcon,
  Speed as FastIcon,
  Security as SecureIcon,
} from '@mui/icons-material';

export default function Home() {
  const theme = useTheme();

  const features = [
    {
      icon: <FormIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Drag & Drop Builder',
      description: 'Intuitive interface to create forms by dragging and dropping field components onto a flexible canvas.',
    },
    {
      icon: <PreviewIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Live Preview',
      description: 'See how your form looks in real-time as you build it with instant preview functionality.',
    },
    {
      icon: <ConfigIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Flexible Configuration',
      description: 'Configure field properties, validations, and layouts with an easy-to-use configuration panel.',
    },
    {
      icon: <SaveIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Save & Manage',
      description: 'Save your forms and manage them efficiently. Edit anytime and track all submissions.',
    },
    {
      icon: <FastIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Lightning Fast',
      description: 'Built with Next.js and React for optimal performance and smooth user experience.',
    },
    {
      icon: <SecureIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Data Persistence',
      description: 'All form data and submissions are securely stored and easily accessible when you need them.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme.palette as any).backgroundGradient,
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            py: 8,
          }}
        >
          {/* Hero Badge */}
          <Box
            sx={{
              px: 3,
              py: 1,
              borderRadius: '24px',
              background: (theme.palette as any).gradient?.soft,
              border: `1px solid ${theme.palette.primary.light}`,
              mb: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              ✨ Dynamic Form Builder
            </Typography>
          </Box>

          {/* Main Heading */}
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              background: (theme.palette as any).gradient?.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Build Custom Forms
            <br />
            With Ease
          </Typography>

          {/* Subheading */}
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mb: 4,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Create powerful, dynamic forms with our intuitive drag-and-drop interface.
            No coding required—just design, configure, and deploy.
          </Typography>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mb: 6,
            }}
          >
            <Link href="/builder" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  ...((theme.typography as any).pillPrimaryButton || {}),
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                }}
              >
                Start Building
              </Button>
            </Link>
            <Link href="/forms" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  ...((theme.typography as any).pillOutlineButton || {}),
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                }}
              >
                View Forms
              </Button>
            </Link>
          </Box>

          {/* Stats */}
          <Box
            sx={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: 0.8,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                ∞
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Custom Fields
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Flexible
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                ⚡
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lightning Fast
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Powerful features to create, manage, and deploy custom forms for any use case.
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'white',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0, 151, 136, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              p: 6,
              borderRadius: 4,
              background: (theme.palette as any).gradient?.soft,
              border: `2px solid ${theme.palette.primary.light}`,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Create your first custom form in minutes. No setup required.
            </Typography>
            <Link href="/builder" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  ...((theme.typography as any).pillPrimaryButton || {}),
                  fontSize: '1.1rem',
                  px: 5,
                  py: 1.5,
                }}
              >
                Create Your First Form
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
