'use client';

import { createTheme, ThemeProvider, ThemeOptions, Theme, PaletteOptions, TypographyVariantsOptions, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useState } from 'react';

export const customTokens = {
    borderRadius: 8,
    drawerWidth: 240,
    appBarHeight: 64,
};

export interface IPaletteOptions extends PaletteOptions {
    gradient: {
        soft: string;
        primary?: string;
        primaryHover?: string;
    };
    scrollbar: {
        '&::-webkit-scrollbar': {
            width: string;
        },
        '&::-webkit-scrollbar-track': {
            background: string;
            borderRadius: string | number;
        },
        '&::-webkit-scrollbar-thumb': {
            background: string;
            borderRadius: string | number;
            '&:hover': {
                background: string;
            }
        }
    };
    backgroundGradient: string;
}

const palette: IPaletteOptions = {
    mode: 'light',
    primary: {
        main: '#009788',
        light: '#def1f0',
        dark: '#02867c',
        contrastText: '#fff',
    },
    secondary: {
        main: '#9c27b0',
        light: '#d05ce3',
        dark: '#6a0080',
        contrastText: '#fff',
    },
    error: {
        main: '#d32f2f',
    },
    warning: {
        main: '#ed6c02',
    },
    info: {
        main: '#0288d1',
    },
    success: {
        main: '#2e7d32',
    },
    background: {
        default: '#fff',
        paper: '#F4F7FA',
    },
    text: {
        primary: '#212121',
        secondary: '#757575',
        disabled: '#bdbdbd',
    },
    gradient: {
        soft: `linear-gradient(135deg, 
          ${alpha('#00897B', 0.05)} 0%, 
          ${alpha('#E8F5E8', 0.08)} 50%,
          ${alpha('#512DA8', 0.06)} 100%)`,
        primary: 'linear-gradient(135deg, #009788 0%, #00bcd4 100%)',
        primaryHover: 'linear-gradient(135deg, #008374 0%, #00acc1 100%)'
    },
    scrollbar: {
        '&::-webkit-scrollbar': {
            width: '8px'
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 151, 136, 0.05)',
            borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #009788 0%, #00bcd4 100%)',
            borderRadius: '4px',
            '&:hover': {
                background: 'linear-gradient(135deg, #008374 0%, #00acc1 100%)'
            }
        }
    },
    backgroundGradient: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
};

export interface ITypographyVariantsOptions extends TypographyVariantsOptions {
    fontFamilySecondary: string;
    commonAvatar: Record<string, any>;
    mediumAvatar: Record<string, any>;
    iconButton: Record<string, any>;
    tableIconButton: Record<string, any>;
    submitButton: Record<string, any>;
    cancelButton: Record<string, any>;
    smallAvatar: Record<string, any>;
    pillPrimaryButton: Record<string, any>;
    pillOutlineButton: Record<string, any>;
    textLinkButton: Record<string, any>;
    chipSoft: Record<string, any>;
    chipOutline: Record<string, any>;
    groupAvatar: Record<string, any>;
    closeButton: Record<string, any>;
}

const typography: ITypographyVariantsOptions = {
    fontFamily: 'var(--font-geist-sans), Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilySecondary: 'Segoe UI',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 700 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 400 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 400 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    button: { fontSize: '0.875rem', fontWeight: 500, textTransform: 'none' },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
    overline: { fontSize: '0.75rem', fontWeight: 400, textTransform: 'uppercase' },
    commonAvatar: {
        cursor: 'pointer',
        borderRadius: '8px'
    },
    mediumAvatar: {
        cursor: 'pointer',
        borderRadius: '8px'
    },
    smallAvatar: {
        cursor: 'pointer',
        height: '32px',
        width: '32px',
        borderRadius: '8px',
        color: palette.primary?.main,
        bgcolor: palette.primary?.light,
        '&:hover': {
            bgcolor: palette.primary?.dark,
            color: palette.primary?.light,
            transform: 'scale(1.05)',
        },
    },
    pillPrimaryButton: {
        borderRadius: 9999,
        fontWeight: 700,
        textTransform: 'none',
        letterSpacing: 0.2,
        px: 2.5,
        py: 0.75,
        background: palette.gradient.primary,
        color: '#ffffff',
        '&:hover': {
            background: palette.gradient.primaryHover || 'linear-gradient(135deg, #008374 0%, #00acc1 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 18px rgba(0, 151, 136, 0.35)'
        },
        transition: 'all 0.2s ease'
    },
    pillOutlineButton: {
        borderRadius: 9999,
        fontWeight: 700,
        textTransform: 'none',
        letterSpacing: 0.2,
        px: 2.5,
        py: 0.75,
        borderColor: palette.primary?.main,
        color: palette.primary?.main,
        background: 'transparent',
        '&:hover': {
            borderColor: palette.primary?.dark,
            background: 'rgba(0, 151, 136, 0.08)'
        },
        transition: 'all 0.2s ease'
    },
    textLinkButton: {
        borderRadius: 9999,
        fontWeight: 600,
        textTransform: 'none',
        color: palette.primary?.main,
        '&:hover': {
            background: alpha(palette.primary?.main || '#009788', 0.08),
            color: palette.primary?.dark
        },
        transition: 'all 0.15s ease'
    },
    chipSoft: {
        background: `linear-gradient(135deg, ${alpha(palette.primary?.main || '#009788', 0.08)} 0%, ${alpha(palette.info?.main || '#0288d1', 0.08)} 100%)`,
        color: palette.primary?.main,
        fontWeight: 500
    },
    chipOutline: {
        borderColor: alpha(palette.primary?.main || '#009788', 0.35),
        color: palette.primary?.main,
        fontWeight: 500
    },
    groupAvatar: {
        background: palette.gradient.primary,
        color: '#ffffff',
        fontWeight: 600
    },
    iconButton: {
        boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
        background: 'linear-gradient(135deg, #009788 0%, #00bcd4 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #008374 0%, #00acc1 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 151, 136, 0.4)'
        },
        transition: 'all 0.3s ease',
        width: { xs: 48, sm: 56 },
        height: { xs: 48, sm: 56 }
    },
    tableIconButton: {
        width: { xs: 28, sm: 32 },
        height: { xs: 28, sm: 32 },
        minWidth: 'unset',
        padding: 1,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #009788 0%, #00bcd4 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0, 151, 136, 0.25)',
        '&:hover': {
            background: 'linear-gradient(135deg, #008374 0%, #00acc1 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 151, 136, 0.35)'
        },
        '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(0, 151, 136, 0.25)'
        },
        transition: 'all 0.2s ease'
    },
    submitButton: {
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
        },
        '&:disabled': {
            transform: 'none',
            boxShadow: 'none'
        }
    },
    cancelButton: {
        borderRadius: 2,
        fontWeight: 600,
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
    },
    closeButton: {
        transition: 'color .25s',
        '&:hover': {
            color: palette.error?.main,
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '120%',
            height: '100%',
            background:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 60%)',
            transform: 'translateX(0)',
            transition: 'transform .6s cubic-bezier(.4,0,.2,1)',
        },
        '&:hover::after': {
            transform: 'translateX(50%)',
        },
    },
};

const themeOptions: ThemeOptions = {
    palette,
    typography,
    spacing: 8,
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    shape: {
        borderRadius: customTokens.borderRadius,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: customTokens.borderRadius,
                    fontWeight: 500,
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(0, 151, 136, 0.25)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 151, 136, 0.35)',
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: customTokens.borderRadius,
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                },
                elevation2: {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: customTokens.borderRadius,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: palette.primary?.main,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
    },
};

export const theme: Theme = createTheme(themeOptions);

// Create emotion cache on client side
function createEmotionCache() {
  return createCache({ key: 'mui' });
}

interface ThemeRegistryProps {
  children: React.ReactNode;
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [cache] = useState(() => createEmotionCache());

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

export type { ThemeOptions, Theme };
