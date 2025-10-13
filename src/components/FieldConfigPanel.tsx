'use client';

import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, PlayArrow as TestIcon } from '@mui/icons-material';
import { useBuilder } from '@/context/BuilderContext';
import { saveForm, updateForm } from '@/lib/persistence';
import { testApiConfiguration } from '@/lib/dropdown-api';

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

  // Local state for editing select options as raw multiline text.
  const [optionsText, setOptionsText] = useState('');
  
  // API testing state
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedField) {
      setOptionsText('');
      return;
    }
    if (selectedField.type === 'select' || selectedField.type === 'radio') {
      const text =
        selectedField.props.options?.map((opt) => opt.label).join('\n') || '';
      setOptionsText(text);
    } else {
      setOptionsText('');
    }
  }, [selectedField?.id]);

  const handleFieldPropChange = (prop: string, value: any) => {
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

  const handleTestApi = async () => {
    if (!selectedField || selectedField.type !== 'select') return;
    
    const { apiEndpoint, apiToken, apiMethod, apiPayload } = selectedField.props;
    
    if (!apiEndpoint || !apiMethod) {
      setApiTestResult({
        success: false,
        message: 'Please configure API endpoint and method first',
      });
      return;
    }
    
    setIsTestingApi(true);
    setApiTestResult(null);
    
    try {
      const result = await testApiConfiguration({
        apiEndpoint,
        apiToken,
        apiMethod,
        apiPayload,
      });
      
      if (result.success) {
        setApiTestResult({
          success: true,
          message: `API test successful! Found ${result.optionsCount} options.`,
        });
      } else {
        setApiTestResult({
          success: false,
          message: result.error || 'API test failed',
        });
      }
    } catch (error) {
      setApiTestResult({
        success: false,
        message: 'API test failed with unexpected error',
      });
    } finally {
      setIsTestingApi(false);
    }
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
              Dropdown Options
            </Typography>
            
            {/* API-driven toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={selectedField.props.isApiDriven || false}
                  onChange={(e) => {
                    handleFieldPropChange('isApiDriven', e.target.checked);
                    // Clear API test result when toggling
                    setApiTestResult(null);
                  }}
                />
              }
              label="API-Driven Options"
            />
            
            {selectedField.props.isApiDriven ? (
              // API Configuration
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="API Endpoint"
                  value={selectedField.props.apiEndpoint || ''}
                  onChange={(e) => handleFieldPropChange('apiEndpoint', e.target.value)}
                  margin="normal"
                  size="small"
                  required
                  placeholder="https://api.example.com/options"
                  helperText="URL of the API endpoint that returns dropdown options"
                />
                
                <TextField
                  fullWidth
                  label="Bearer Token"
                  type="password"
                  value={selectedField.props.apiToken || ''}
                  onChange={(e) => handleFieldPropChange('apiToken', e.target.value)}
                  margin="normal"
                  size="small"
                  placeholder="Optional authentication token"
                  helperText="Bearer token for API authentication (optional)"
                />
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>HTTP Method</InputLabel>
                  <Select
                    value={selectedField.props.apiMethod || 'GET'}
                    onChange={(e) => {
                      handleFieldPropChange('apiMethod', e.target.value);
                      // Clear payload if switching to GET
                      if (e.target.value === 'GET') {
                        handleFieldPropChange('apiPayload', '');
                      }
                    }}
                    label="HTTP Method"
                  >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                  </Select>
                </FormControl>
                
                {selectedField.props.apiMethod === 'POST' && (
                  <TextField
                    fullWidth
                    label="Request Payload (JSON)"
                    value={selectedField.props.apiPayload || ''}
                    onChange={(e) => handleFieldPropChange('apiPayload', e.target.value)}
                    margin="normal"
                    size="small"
                    multiline
                    rows={3}
                    placeholder='{"category": "example"}'
                    helperText="JSON payload for POST request (optional)"
                  />
                )}
                
                {/* Test API Button */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleTestApi}
                    disabled={isTestingApi || !selectedField.props.apiEndpoint}
                    startIcon={isTestingApi ? <CircularProgress size={16} /> : <TestIcon />}
                  >
                    {isTestingApi ? 'Testing...' : 'Test API'}
                  </Button>
                </Box>
                
                {/* API Test Result */}
                {apiTestResult && (
                  <Alert 
                    severity={apiTestResult.success ? 'success' : 'error'} 
                    sx={{ mt: 1 }}
                    onClose={() => setApiTestResult(null)}
                  >
                    {apiTestResult.message}
                  </Alert>
                )}
                
                {/* API Response Format Info */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Expected API Response:</strong>
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
{`{
  "data": [
    {"value": "1", "label": "Option 1"},
    {"value": "2", "label": "Option 2"}
  ]
}`}
                  </Typography>
                </Alert>
              </Box>
            ) : (
              // Static Options
              <TextField
                fullWidth
                label="Options (one per line)"
                value={optionsText}
                onChange={(e) => {
                  const raw = e.target.value;
                  setOptionsText(raw);
                  const lines = raw
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean);
                  const options = lines.map((line) => ({
                    value: line.toLowerCase().replace(/\s+/g, '_'),
                    label: line,
                  }));
                  handleFieldPropChange('options', options as any);
                }}
                margin="normal"
                size="small"
                multiline
                rows={4}
                helperText="Enter each option on a new line"
              />
            )}
          </Box>
        )}
        
        {/* Radio field options (keep existing) */}
        {selectedField.type === 'radio' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Options
            </Typography>
            <TextField
              fullWidth
              label="Options (one per line)"
              value={optionsText}
              onChange={(e) => {
                const raw = e.target.value;
                setOptionsText(raw);
                const lines = raw
                  .split(/\r?\n/)
                  .map((line) => line.trim())
                  .filter(Boolean);
                const options = lines.map((line) => ({
                  value: line.toLowerCase().replace(/\s+/g, '_'),
                  label: line,
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
