/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { FormField, FormSchema } from '@/lib/schema';
import { getColumnConfig, getFieldAtPosition, getMaxRowsInLayout } from '@/lib/layout';
import { submitForm } from '@/lib/persistence';
import { useDropdownCache } from '@/context/DropdownCacheContext';
import { DropdownOption } from '@/lib/dropdown-api';

interface FormFillerFieldProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

function FormFillerField({ field, value, onChange, error }: FormFillerFieldProps) {
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
        } catch (error) {
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

interface FormFillerColumnProps {
    columnId: string;
    width: number;
    maxRows: number;
    schema: FormSchema;
    formData: Record<string, any>;
    errors: Record<string, string>;
    onFieldChange: (fieldKey: string, value: any) => void;
}

function FormFillerColumn({
    columnId,
    width,
    maxRows,
    schema,
    formData,
    errors,
    onFieldChange,
}: FormFillerColumnProps) {
    const columnConfig = getColumnConfig(schema.layout, columnId);

    if (!columnConfig) return null;

    const { slotsPerRow } = columnConfig;

    return (
        <Box sx={{ flex: `0 0 ${width}%`, maxWidth: `${width}%` }}>
            <Paper
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
                <Box sx={{ p: 1 }}>
                    {columnConfig.sectionName && (
                        <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                            {columnConfig.sectionName}
                        </Typography>
                    )}
                </Box>
                <Divider />

                {/* Grid of cells - only showing fields, no empty cells */}
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
                            <Box key={rowIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                {Array.from({ length: slotsPerRow }).map((_, slotIndex) => {
                                    const position = { columnId, rowIndex, slotIndex };
                                    const fieldId = getFieldAtPosition(position, schema.positions);
                                    const field = fieldId ? schema.fields.find(f => f.id === fieldId) : undefined;

                                    // Only render the cell if it has a field
                                    if (!field) return null;

                                    return (
                                        <Box
                                            key={`${rowIndex}-${slotIndex}`}
                                            sx={{
                                                flex: `0 0 ${100 / slotsPerRow}%`,
                                                maxWidth: `${100 / slotsPerRow}%`,
                                                minHeight: 80,
                                                p: 0.5,
                                            }}
                                        >
                                            <FormFillerField
                                                field={field}
                                                value={formData[field.key]}
                                                onChange={(value) => onFieldChange(field.key, value)}
                                                error={errors[field.key]}
                                            />
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

interface FormFillerProps {
    schema: FormSchema;
    onSubmitSuccess?: () => void;
}

export function FormFiller({ schema, onSubmitSuccess }: FormFillerProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Calculate max rows to match canvas behavior
    const maxRows = getMaxRowsInLayout(schema.positions, 3);

    const handleFieldChange = (fieldKey: string, value: any) => {
        setFormData((prev) => ({ ...prev, [fieldKey]: value }));
        // Clear error when field is modified
        if (errors[fieldKey]) {
            setErrors((prev) => ({ ...prev, [fieldKey]: '' }));
        }
        // Clear submit message when form is modified
        if (submitMessage) {
            setSubmitMessage(null);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const result = await submitForm(schema.metadata.id, formData);

            if (result.success) {
                setSubmitMessage({ type: 'success', text: 'Form submitted successfully!' });
                setFormData({}); // Clear form
                setErrors({});
                if (onSubmitSuccess) {
                    onSubmitSuccess();
                }
            } else {
                if (result.validationErrors) {
                    setErrors(result.validationErrors);
                }
                setSubmitMessage({
                    type: 'error',
                    text: result.error || 'Failed to submit form'
                });
            }
        } catch (error) {
            setSubmitMessage({
                type: 'error',
                text: 'An unexpected error occurred'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {schema.fields.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        This form has no fields to fill
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Submit message */}
                    {submitMessage && (
                        <Alert
                            severity={submitMessage.type}
                            sx={{ mb: 2 }}
                            onClose={() => setSubmitMessage(null)}
                        >
                            {submitMessage.text}
                        </Alert>
                    )}

                    {/* Canvas-like layout structure */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {schema.layout.columns.map((column) => (
                            <FormFillerColumn
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
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}
