'use client';

import React from 'react';
import { Container, Box, Grid } from '@mui/material';
import { BuilderProvider } from '@/context/BuilderContext';
import FieldPalette from '@/components/FieldPalette';
import Canvas from '@/components/Canvas';
import FieldConfigPanel from '@/components/FieldConfigPanel';

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
            <FieldConfigPanel />
          </Grid>
        </Grid>
      </Container>
    </BuilderProvider>
  );
}