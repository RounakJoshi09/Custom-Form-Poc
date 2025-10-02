'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useBuilder } from '@/context/BuilderContext';
import { saveForm, updateForm } from '@/lib/persistence';

export default function FieldConfigPanel() {
  const { state, actions } = useBuilder();
  const [saveNotification, setSaveNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const selectedField = state.selectedFieldId
    ? state.schema.fields.find((f) => f.id === state.selectedFieldId)
    : null;

  const handleFieldPropChange = (prop: string, value: string) => {
    if (!selectedField) return;
    actions.updateFieldProps(selectedField.id, { [prop]: value });
  };

  const handleValidationChange = (validation: string, value: boolean) => {
    if (!selectedField) return;
    actions.updateFieldValidation(selectedField.id, { [validation]: value });
  };

  const handleFormMetadataChange = (field: string, value: string) => {
    actions.updateFormMetadata({ [field]: value });
  };

  const handleSaveForm = async () => {
    try {
      // Check if this is a new form or an update
      const isNewForm = state.schema.metadata.name === 'Untitled Form';

      if (isNewForm) {
        const result = await saveForm(state.schema);
        if (result.success) {
          setSaveNotification({
            open: true,
            message: 'Form saved successfully!',
            type: 'success',
          });
        } else {
          setSaveNotification({
            open: true,
            message: result.error || 'Failed to save form',
            type: 'error',
          });
        }
      } else {
        const result = await updateForm(state.schema);
        if (result.success) {
          setSaveNotification({
            open: true,
            message: 'Form updated successfully!',
            type: 'success',
          });
        } else {
          setSaveNotification({
            open: true,
            message: result.error || 'Failed to update form',
            type: 'error',
          });
        }
      }
    } catch (error) {
      setSaveNotification({
        open: true,
        message: 'An error occurred while saving',
        type: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setSaveNotification((prev) => ({ ...prev, open: false }));
  };

  if (!selectedField) {
    return (
      <Paper elevation={1} sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Configuration
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Form-level configuration */}
        <Typography variant="subtitle2" gutterBottom>
          Form Settings
        </Typography>

        <TextField
          fullWidth
          label="Form Name"
          value={state.schema.metadata.name}
          onChange={(e) => handleFormMetadataChange('name', e.target.value)}
          margin="normal"
          size="small"
        />

        <TextField
          fullWidth
          label="Description"
          value={state.schema.metadata.description || ''}
          onChange={(e) =>
            handleFormMetadataChange('description', e.target.value)
          }
          margin="normal"
          size="small"
          multiline
          rows={2}
        />

        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            Select a field to configure its properties
          </Alert>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSaveForm}
          >
            Save Form
          </Button>
        </Box>

        <Snackbar
          open={saveNotification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={saveNotification.type}
          >
            {saveNotification.message}
          </Alert>
        </Snackbar>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Field Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedField.type} field
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {/* Basic Properties */}
        <Typography variant="subtitle2" gutterBottom>
          Basic Properties
        </Typography>

        <TextField
          fullWidth
          label="Field Label"
          value={selectedField.props.label}
          onChange={(e) => handleFieldPropChange('label', e.target.value)}
          margin="normal"
          size="small"
          required
        />

        <TextField
          fullWidth
          label="Placeholder Text"
          value={selectedField.props.placeholder || ''}
          onChange={(e) => handleFieldPropChange('placeholder', e.target.value)}
          margin="normal"
          size="small"
        />

        <TextField
          fullWidth
          label="Helper Text"
          value={selectedField.props.helperText || ''}
          onChange={(e) => handleFieldPropChange('helperText', e.target.value)}
          margin="normal"
          size="small"
          multiline
          rows={2}
        />

        {/* Select field options */}
        {selectedField.type === 'select' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Options
            </Typography>
            <TextField
              fullWidth
              label="Options (one per line)"
              value={
                selectedField.props.options
                  ?.map((opt) => opt.label)
                  .join('\n') || ''
              }
              onChange={(e) => {
                const lines = e.target.value
                  .split('\n')
                  .filter((line) => line.trim());
                const options = lines.map((line) => ({
                  value: line.trim().toLowerCase().replace(/\s+/g, '_'),
                  label: line.trim(),
                }));
                handleFieldPropChange('options', options as any);
              }}
              margin="normal"
              size="small"
              multiline
              rows={4}
              helperText="Enter each option on a new line"
            />
          </Box>
        )}

        {/* File field properties */}
        {selectedField.type === 'file' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              File Properties
            </Typography>
            <TextField
              fullWidth
              label="Accepted File Types"
              value={selectedField.props.accept || ''}
              onChange={(e) => handleFieldPropChange('accept', e.target.value)}
              margin="normal"
              size="small"
              placeholder="e.g., .pdf,.doc,.docx"
              helperText="Specify file extensions separated by commas"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedField.props.multiple || false}
                  onChange={(e) =>
                    handleFieldPropChange('multiple', e.target.checked as any)
                  }
                />
              }
              label="Allow multiple files"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Validation */}
        <Typography variant="subtitle2" gutterBottom>
          Validation
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={selectedField.validation.required || false}
              onChange={(e) =>
                handleValidationChange('required', e.target.checked)
              }
            />
          }
          label="Required field"
        />

        <Divider sx={{ my: 2 }} />

        {/* Field Actions */}
        <Typography variant="subtitle2" gutterBottom>
          Actions
        </Typography>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={() => actions.removeField(selectedField.id)}
        >
          Delete Field
        </Button>
      </Box>

      <Snackbar
        open={saveNotification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={saveNotification.type}
        >
          {saveNotification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
