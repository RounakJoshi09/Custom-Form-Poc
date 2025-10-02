// Field types supported by the form builder
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'file';

// Validation rules for fields
export interface FieldValidation {
  required?: boolean;
  // Extensible for future validation rules
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Field properties that can be customized
export interface FieldProps {
  label: string;
  placeholder?: string;
  helperText?: string;
  // For select fields
  options?: Array<{ value: string; label: string }>;
  // For file fields
  accept?: string;
  multiple?: boolean;
}

// Individual field definition
export interface FormField {
  id: string;
  type: FieldType;
  key: string; // Form field name
  props: FieldProps;
  validation: FieldValidation;
}

// Layout configuration
export type LayoutType = '25-75' | '50-50' | '75-25' | '100';

export interface LayoutConfig {
  type: LayoutType;
  columns: ColumnConfig[];
}

export interface ColumnConfig {
  id: string;
  width: number; // Percentage: 25, 50, 75, or 100
  slotsPerRow: number; // Max fields per sub-row
  maxRows: number; // Max sub-rows in this column
}

// Position of a field within the layout
export interface FieldPosition {
  columnId: string;
  rowIndex: number;
  slotIndex: number;
}

// Complete form schema
export interface FormSchema {
  metadata: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  layout: LayoutConfig;
  fields: FormField[];
  positions: Record<string, FieldPosition>; // fieldId -> position
}

// Form builder state
export interface BuilderState {
  schema: FormSchema;
  selectedFieldId: string | null;
  draggedFieldId: string | null;
}
