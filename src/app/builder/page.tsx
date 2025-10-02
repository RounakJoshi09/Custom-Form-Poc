'use client';

import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Paper } from '@mui/material';
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
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          height: 'calc(100vh - 32px)',
          alignItems: 'stretch',
        }}
      >
        {/* Field Palette - 10% */}
        <Box sx={{ width: '10%', minWidth: 180, overflow: 'auto' }}>
          <FieldPalette />
        </Box>

        {/* Main Content Area - 80% */}
        <Box sx={{ width: '80%', minWidth: 600, display: 'flex' }}>
          <Paper
            elevation={1}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
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
        </Box>

        {/* Configuration Panel - 10% */}
        <Box sx={{ width: '10%', minWidth: 220, overflow: 'auto' }}>
          <FieldConfigPanel />
        </Box>
      </Box>
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
