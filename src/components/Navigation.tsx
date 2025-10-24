'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  DynamicForm as FormIcon,
  ListAlt as FormsListIcon,
} from '@mui/icons-material';

export default function Navigation() {
  const theme = useTheme();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo/Brand */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: (theme.palette as any).gradient?.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 151, 136, 0.3)',
                }}
              >
                F
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  background: (theme.palette as any).gradient?.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Custom Forms
              </Typography>
            </Box>
          </Link>

          {/* Nav Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 4 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<DashboardIcon />}
                sx={{
                  color: isActive('/') && pathname === '/' ? theme.palette.primary.main : theme.palette.text.secondary,
                  fontWeight: isActive('/') && pathname === '/' ? 600 : 400,
                  position: 'relative',
                  '&::after': isActive('/') && pathname === '/'
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '10%',
                        right: '10%',
                        height: '3px',
                        background: (theme.palette as any).gradient?.primary,
                        borderRadius: '3px 3px 0 0',
                      }
                    : {},
                  '&:hover': {
                    color: theme.palette.primary.main,
                    background: 'rgba(0, 151, 136, 0.05)',
                  },
                }}
              >
                Home
              </Button>
            </Link>

            <Link href="/builder" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<FormIcon />}
                sx={{
                  color: isActive('/builder') ? theme.palette.primary.main : theme.palette.text.secondary,
                  fontWeight: isActive('/builder') ? 600 : 400,
                  position: 'relative',
                  '&::after': isActive('/builder')
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '10%',
                        right: '10%',
                        height: '3px',
                        background: (theme.palette as any).gradient?.primary,
                        borderRadius: '3px 3px 0 0',
                      }
                    : {},
                  '&:hover': {
                    color: theme.palette.primary.main,
                    background: 'rgba(0, 151, 136, 0.05)',
                  },
                }}
              >
                Builder
              </Button>
            </Link>

            <Link href="/forms" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<FormsListIcon />}
                sx={{
                  color: isActive('/forms') ? theme.palette.primary.main : theme.palette.text.secondary,
                  fontWeight: isActive('/forms') ? 600 : 400,
                  position: 'relative',
                  '&::after': isActive('/forms')
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '10%',
                        right: '10%',
                        height: '3px',
                        background: (theme.palette as any).gradient?.primary,
                        borderRadius: '3px 3px 0 0',
                      }
                    : {},
                  '&:hover': {
                    color: theme.palette.primary.main,
                    background: 'rgba(0, 151, 136, 0.05)',
                  },
                }}
              >
                Forms
              </Button>
            </Link>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link href="/builder" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  background: (theme.palette as any).gradient?.primary,
                  borderRadius: '20px',
                  px: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 151, 136, 0.25)',
                  '&:hover': {
                    background: (theme.palette as any).gradient?.primaryHover,
                    boxShadow: '0 6px 16px rgba(0, 151, 136, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Create Form
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
