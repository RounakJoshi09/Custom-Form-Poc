'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import { FormField, FormSchema } from '@/lib/schema';
import { getColumnFields, getColumnConfig } from '@/lib/layout';

interface PreviewFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function PreviewField({ field, value, onChange, error }: PreviewFieldProps) {
  const commonProps = {
    fullWidth: true,
    label: field.props.label,
    helperText: error || field.props.helperText,
    error: Boolean(error),
    size: 'small' as const,
    margin: 'normal' as const,
  };

  switch (field.type) {
    case 'text':
      return (
        <TextField
          {...commonProps}
          type="text"
          placeholder={field.props.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          multiline
          rows={3}
          placeholder={field.props.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <FormControl {...commonProps}>
          <InputLabel>{field.props.label}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            label={field.props.label}
          >
            {field.props.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'date':
      return (
        <TextField
          {...commonProps}
          type="date"
          InputLabelProps={{ shrink: true }}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'datetime':
      return (
        <TextField
          {...commonProps}
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={field.props.label}
          sx={{ mt: 2, mb: 1 }}
        />
      );

    case 'file':
      return (
        <TextField
          {...commonProps}
          type="file"
          InputLabelProps={{ shrink: true }}
          inputProps={{
            accept: field.props.accept || '',
            multiple: field.props.multiple || false,
          }}
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            onChange(target.files);
          }}
        />
      );

    default:
      return (
        <TextField {...commonProps} disabled value="Unsupported field type" />
      );
  }
}

interface PreviewColumnProps {
  columnId: string;
  width: number;
  schema: FormSchema;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onFieldChange: (fieldKey: string, value: any) => void;
}

function PreviewColumn({
  columnId,
  width,
  schema,
  formData,
  errors,
  onFieldChange,
}: PreviewColumnProps) {
  const columnFields = getColumnFields(
    columnId,
    schema.fields,
    schema.positions
  );
  const columnConfig = getColumnConfig(schema.layout, columnId);

  if (!columnConfig) return null;

  return (
    <Grid
      item
      xs={12}
      md={width === 25 ? 3 : width === 50 ? 6 : width === 75 ? 9 : 12}
    >
      <Box sx={{ p: 1 }}>
        {columnFields.length === 0 ? (
          <Box
            sx={{
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No fields in this column
            </Typography>
          </Box>
        ) : (
          <Box>
            {columnFields.map((row, rowIndex) => (
              <Grid container spacing={2} key={rowIndex} sx={{ mb: 1 }}>
                {Array.from({ length: columnConfig.slotsPerRow }).map(
                  (_, slotIndex) => {
                    const field = row[slotIndex];
                    if (!field)
                      return (
                        <Grid
                          item
                          xs={12 / columnConfig.slotsPerRow}
                          key={slotIndex}
                        />
                      );

                    return (
                      <Grid
                        item
                        xs={12 / columnConfig.slotsPerRow}
                        key={slotIndex}
                      >
                        <PreviewField
                          field={field}
                          value={formData[field.key]}
                          onChange={(value) => onFieldChange(field.key, value)}
                          error={errors[field.key]}
                        />
                      </Grid>
                    );
                  }
                )}
              </Grid>
            ))}
          </Box>
        )}
      </Box>
    </Grid>
  );
}

interface FormPreviewProps {
  schema: FormSchema;
}

export function FormPreview({ schema }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    // Clear error when field is modified
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    schema.fields.forEach((field) => {
      const value = formData[field.key];

      if (field.validation.required) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.key] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert(
        'Form submitted successfully!\\n\\nData: ' +
          JSON.stringify(formData, null, 2)
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {schema.fields.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Add fields to see the form preview
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {schema.layout.columns.map((column) => (
              <PreviewColumn
                key={column.id}
                columnId={column.id}
                width={column.width}
                schema={schema}
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            ))}
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Submit Form
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

interface PreviewPanelProps {
  schema?: FormSchema;
}

export default function PreviewPanel({ schema }: PreviewPanelProps) {
  if (!schema) {
    return (
      <Paper elevation={1} sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Form Preview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">No form schema provided for preview</Alert>
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
          {schema.metadata.name} - Preview
        </Typography>
        {schema.metadata.description && (
          <Typography variant="body2" color="text.secondary">
            {schema.metadata.description}
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <FormPreview schema={schema} />
      </Box>
    </Paper>
  );
}
