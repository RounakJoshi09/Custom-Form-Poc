/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  Divider,
  Alert,
  OutlinedInput,
  InputLabel,
  Select,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { FormField, FormSchema } from '@/lib/schema';
import { getColumnConfig, getMaxRowsInLayout, getFieldAtPosition, getSections, getSectionFields } from '@/lib/layout';
import { useDropdownCache } from '@/context/DropdownCacheContext';
import { DropdownOption } from '@/lib/dropdown-api';

interface PreviewFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function PreviewField({ field, value, onChange, error }: PreviewFieldProps) {
  // Track open state for select to control label shrink/notch like a text field
  const [selectOpen, setSelectOpen] = useState(false);
  const [apiOptions, setApiOptions] = useState<DropdownOption[]>([]);
  const [apiOptionsLoaded, setApiOptionsLoaded] = useState(false);

  const dropdownCache = useDropdownCache();

  // Load API options for select fields when opened
  const loadApiOptions = async () => {
    if (field.type !== 'select' || !field.props.isApiDriven || apiOptionsLoaded) {
      return;
    }

    const { apiEndpoint, apiToken, apiMethod, apiPayload } = field.props;

    if (!apiEndpoint || !apiMethod) {
      return;
    }

    try {
      const options = await dropdownCache.getOptions(field.id, {
        apiEndpoint,
        apiToken,
        apiMethod,
        apiPayload,
      });

      setApiOptions(options);
      setApiOptionsLoaded(true);
    } catch {
      // Error handling is done in the cache context
      setApiOptionsLoaded(true);
    }
  };

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

    case 'select': {
      const isApiDriven = field.props.isApiDriven;
      const staticOptions = field.props.options ?? [];
      const options = isApiDriven ? apiOptions : staticOptions;
      const isFilled = Boolean(value);
      const isLoading = isApiDriven && dropdownCache.isLoading(field.id);
      const hasApiError = isApiDriven && dropdownCache.hasError(field.id);
      const isDisabled = isApiDriven && (isLoading || hasApiError);

      return (
        <FormControl fullWidth size="small" margin="normal" error={Boolean(error)}>
          <InputLabel shrink={selectOpen || isFilled}>{field.props.label}</InputLabel>
          <Select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onOpen={() => {
              setSelectOpen(true);
              if (isApiDriven) {
                loadApiOptions();
              }
            }}
            onClose={() => setSelectOpen(false)}
            disabled={isDisabled}
            renderValue={(selected) => {
              if (selected === '' || selected === undefined || selected === null) {
                return '';
              }
              const found = options.find((o) => o.value === selected);
              return found ? found.label : String(selected);
            }}
            input={
              <OutlinedInput
                label={field.props.label}
                notched={selectOpen || isFilled}
              />
            }
          >
            {isLoading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Loading options...</Typography>
                </Box>
              </MenuItem>
            ) : [
              <MenuItem key="empty" value="" disabled={Boolean(field.validation.required)}>
                {field.props.placeholder || 'Select an option'}
              </MenuItem>,
              ...options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ]}
          </Select>
          {(error || field.props.helperText) && (
            <FormHelperText error={Boolean(error)}>
              {error || field.props.helperText}
            </FormHelperText>
          )}
        </FormControl>
      );
    }

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

    case 'radio': {
      const options = field.props.options ?? [];
      return (
        <FormControl component="fieldset" error={Boolean(error)} sx={{ width: '100%', mt: 1 }}>
          <FormLabel component="legend" sx={{ typography: 'body1', mb: 0.5 }}>
            {field.props.label}
          </FormLabel>
          <RadioGroup
            row
            value={value ?? ''}
            onChange={(e) => onChange((e.target as HTMLInputElement).value)}
            sx={{ flexWrap: 'wrap', alignItems: 'center', width: '10rem' }}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  sx={{
                    flex: '0 0 50%',
                    display: 'flex',
                    m: 0,
                    alignItems: 'center',
                    '.MuiFormControlLabel-label': {
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      lineHeight: 1.5,
                    },
                  }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                No options configured
              </Typography>
            )}
          </RadioGroup>
          {(error || field.props.helperText) && (
            <FormHelperText error={Boolean(error)} sx={{ mt: 0.5 }}>
              {error || field.props.helperText}
            </FormHelperText>
          )}
        </FormControl>
      );
    }

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
  maxRows: number;
  schema: FormSchema;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onFieldChange: (fieldKey: string, value: any) => void;
}

// PreviewSection component for rendering individual sections
function PreviewSection({
  sectionId,
  sectionName,
  slotsPerRow,
  columnId,
  maxRows,
  schema,
  formData,
  errors,
  onFieldChange,
  hideHeader = false,
}: {
  sectionId: string;
  sectionName: string;
  slotsPerRow: number;
  columnId: string;
  maxRows: number;
  schema: FormSchema;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onFieldChange: (fieldKey: string, value: any) => void;
  hideHeader?: boolean;
}) {
  return (
    <Box sx={{ mb: hideHeader ? 0 : 3 }}>
      {/* Section Header - hidden when in tab mode */}
      {!hideHeader && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
            {sectionName}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      {/* Section Fields */}
      {Array.from({ length: maxRows }).map((_, rowIndex) => {
        // Check if this row has any fields in this section
        const rowHasFields = Array.from({ length: slotsPerRow }).some((_, slotIndex) => {
          const position = { columnId, sectionId, rowIndex, slotIndex };
          const fieldId = getFieldAtPosition(position, schema.positions);
          return fieldId !== null;
        });

        // Only render the row if it has fields
        if (!rowHasFields) return null;

        return (
          <Box key={rowIndex} sx={{
            display: 'flex',
            gap: 1,
            mb: 1,
            width: '100%',
            overflow: 'hidden'
          }}>
            {Array.from({ length: slotsPerRow }).map((_, slotIndex) => {
              const position = { columnId, sectionId, rowIndex, slotIndex };
              const fieldId = getFieldAtPosition(position, schema.positions);
              const field = fieldId ? schema.fields.find(f => f.id === fieldId) : undefined;

              return (
                <Box
                  key={`${rowIndex}-${slotIndex}`}
                  sx={{
                    flex: `0 0 ${100 / slotsPerRow}%`,
                    maxWidth: `${100 / slotsPerRow}%`,
                    minHeight: 80,
                    p: 0.5,
                    minWidth: 0,
                    overflow: 'hidden',
                    visibility: field ? 'visible' : 'hidden',
                  }}
                >
                  {field && (
                    <PreviewField
                      field={field}
                      value={formData[field.key]}
                      onChange={(value) => onFieldChange(field.key, value)}
                      error={errors[field.key]}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

function PreviewColumn({
  columnId,
  maxRows,
  schema,
  formData,
  errors,
  onFieldChange,
}: PreviewColumnProps) {
  const columnConfig = getColumnConfig(schema.layout, columnId);
  const [activeTab, setActiveTab] = useState(0);

  if (!columnConfig) return null;

  const { slotsPerRow } = columnConfig;
  const sections = getSections(columnConfig);
  const isFullWidth = columnConfig.width === 100;
  const shouldTabify = schema.layout.tabify && sections.length > 1;

  // Render sections for 100% width columns with tabs
  if (isFullWidth && sections.length > 0 && shouldTabify) {
    return (
      <Box sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
          }}
        >
          {/* Tabs Header */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            {sections.map((section, index) => (
              <Tab key={section.id} label={section.name} />
            ))}
          </Tabs>

          {/* Active Tab Content */}
          {sections.map((section, index) => (
            <Box
              key={section.id}
              role="tabpanel"
              hidden={activeTab !== index}
              sx={{ display: activeTab === index ? 'block' : 'none' }}
            >
              {activeTab === index && (
                <PreviewSection
                  sectionId={section.id}
                  sectionName={section.name}
                  slotsPerRow={section.slotsPerRow}
                  columnId={columnId}
                  maxRows={maxRows}
                  schema={schema}
                  formData={formData}
                  errors={errors}
                  onFieldChange={onFieldChange}
                  hideHeader={true}
                />
              )}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  }

  // Render sections for 100% width columns vertically (without tabs)
  if (isFullWidth && sections.length > 0) {
    return (
      <Box sx={{
        width: '100%',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
          }}
        >
          {sections.map((section, index) => (
            <PreviewSection
              key={section.id}
              sectionId={section.id}
              sectionName={section.name}
              slotsPerRow={section.slotsPerRow}
              columnId={columnId}
              maxRows={maxRows}
              schema={schema}
              formData={formData}
              errors={errors}
              onFieldChange={onFieldChange}
            />
          ))}
        </Paper>
      </Box>
    );
  }

  // Original single column rendering for non-100% layouts
  return (
    <Box sx={{
      width: '100%',
      minWidth: 0, // Allow shrinking
      overflow: 'hidden' // Prevent content overflow
    }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 1 }}>
          {columnConfig.sectionName && (
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              {columnConfig.sectionName}
            </Typography>
          )}
        </Box>
        <Divider />

        {/* Grid of cells - maintaining exact positioning like canvas */}
        <Box sx={{ p: 1 }}>
          {Array.from({ length: maxRows }).map((_, rowIndex) => {
            // Check if this row has any fields
            const rowHasFields = Array.from({ length: slotsPerRow }).some((_, slotIndex) => {
              const position = { columnId, rowIndex, slotIndex };
              const fieldId = getFieldAtPosition(position, schema.positions);
              return fieldId !== null;
            });

            // Only render the row if it has fields
            if (!rowHasFields) return null;

            return (
              <Box key={rowIndex} sx={{
                display: 'flex',
                gap: 1,
                mb: 1,
                width: '100%',
                overflow: 'hidden' // Prevent row overflow
              }}>
                {Array.from({ length: slotsPerRow }).map((_, slotIndex) => {
                  const position = { columnId, rowIndex, slotIndex };
                  const fieldId = getFieldAtPosition(position, schema.positions);
                  const field = fieldId ? schema.fields.find(f => f.id === fieldId) : undefined;

                  return (
                    <Box
                      key={`${rowIndex}-${slotIndex}`}
                      sx={{
                        flex: `0 0 ${100 / slotsPerRow}%`,
                        maxWidth: `${100 / slotsPerRow}%`,
                        minHeight: 80,
                        p: 0.5,
                        minWidth: 0, // Allow shrinking
                        overflow: 'hidden', // Prevent content overflow
                        // Make empty cells invisible but maintain their space
                        visibility: field ? 'visible' : 'hidden',
                      }}
                    >
                      {field && (
                        <PreviewField
                          field={field}
                          value={formData[field.key]}
                          onChange={(value) => onFieldChange(field.key, value)}
                          error={errors[field.key]}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

interface FormPreviewProps {
  schema: FormSchema;
}

export function FormPreview({ schema }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate max rows to match canvas behavior
  const maxRows = getMaxRowsInLayout(schema.positions, 3);

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
          {/* Canvas-like layout structure */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: schema.layout.columns.map(col => `${col.width}fr`).join(' '),
            gap: 2,
            width: '100%',
            overflow: 'hidden' // Prevent horizontal overflow
          }}>
            {schema.layout.columns.map((column) => (
              <PreviewColumn
                key={column.id}
                columnId={column.id}
                width={column.width}
                maxRows={maxRows}
                schema={schema}
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            ))}
          </Box>

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
