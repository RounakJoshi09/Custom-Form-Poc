'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Container, Box, Tabs, Tab, Paper, Button, Alert, Snackbar, CircularProgress, Typography } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { BuilderProvider, useBuilder } from '@/context/BuilderContext';
import FieldPalette from '@/components/FieldPalette';
import Canvas from '@/components/Canvas';
import FieldConfigPanel from '@/components/FieldConfigPanel';
import PreviewPanel from '@/components/PreviewPanel';
import { saveForm, updateForm, loadForm } from '@/lib/persistence';
import { useSearchParams } from 'next/navigation';

function BuilderContent() {
  const [currentTab, setCurrentTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { state, dispatch } = useBuilder();
  const searchParams = useSearchParams();

  // Load existing form if ID is provided
  useEffect(() => {
    const formId = searchParams.get('id');
    if (formId) {
      loadForm(formId).then(({ schema, error }) => {
        if (schema) {
          dispatch({ type: 'LOAD_SCHEMA', payload: schema });
        } else if (error) {
          setSaveMessage({ type: 'error', text: error });
        }
      });
    }
  }, [searchParams, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSave = async () => {
    if (state.schema.fields.length === 0) {
      setSaveMessage({ type: 'error', text: 'Please add at least one field before saving' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const isUpdate = Boolean(state.schema.metadata.id);
      const result = isUpdate
        ? await updateForm(state.schema)
        : await saveForm(state.schema);

      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: isUpdate ? 'Form updated successfully!' : 'Form saved successfully!'
        });
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save form' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      {/* Save Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Form'}
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          height: 'calc(100vh - 100px)',
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

      {/* Save Message Snackbar */}
      <Snackbar
        open={Boolean(saveMessage)}
        autoHideDuration={6000}
        onClose={() => setSaveMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSaveMessage(null)}
          severity={saveMessage?.type}
          sx={{ width: '100%' }}
        >
          {saveMessage?.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Loading component for Suspense fallback
function BuilderLoading() {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 100px)' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading form builder...
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <Suspense fallback={<BuilderLoading />}>
        <BuilderContent />
      </Suspense>
    </BuilderProvider>
  );
}
