'use client';

import React, { useState } from 'react';
import { Container, Box, Grid, Tabs, Tab, Paper } from '@mui/material';
import { BuilderProvider, useBuilder } from '@/context/BuilderContext';
import FieldPalette from '@/components/FieldPalette';
import Canvas from '@/components/Canvas';
import FieldConfigPanel from '@/components/FieldConfigPanel';
import PreviewPanel from '@/components/PreviewPanel';

function BuilderContent() {
  const [currentTab, setCurrentTab] = useState(0);
  const { state } = useBuilder();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 32px)' }}>
        {/* Field Palette */}
        <Grid item xs={12} md={3}>
          <FieldPalette />
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Canvas" />
              <Tab label="Preview" />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {currentTab === 0 && <Canvas />}
              {currentTab === 1 && <PreviewPanel schema={state.schema} />}
            </Box>
          </Paper>
        </Grid>

        {/* Configuration Panel */}
        <Grid item xs={12} md={3}>
          <FieldConfigPanel />
        </Grid>
      </Grid>
    </Container>
  );
}

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  );
}
