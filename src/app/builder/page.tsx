'use client';

import React from 'react';
import { Container, Box, Grid } from '@mui/material';
import { BuilderProvider } from '@/context/BuilderContext';
import FieldPalette from '@/components/FieldPalette';
import Canvas from '@/components/Canvas';

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <Container maxWidth={false} sx={{ py: 2 }}>
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 32px)' }}>
          {/* Field Palette */}
          <Grid item xs={12} md={3}>
            <FieldPalette />
          </Grid>
          
          {/* Canvas Area */}
          <Grid item xs={12} md={6}>
            <Canvas />
          </Grid>
          
          {/* Configuration Panel */}
          <Grid item xs={12} md={3}>
            <Box 
              sx={{ 
                height: '100%', 
                border: '1px solid #ddd', 
                borderRadius: 1,
                p: 2,
                backgroundColor: 'background.paper'
              }}
            >
              Configuration Panel (Coming Soon)
            </Box>
          </Grid>
        </Grid>
      </Container>
    </BuilderProvider>
  );
}