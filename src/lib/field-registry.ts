import { FieldType } from './schema';

export interface FieldDefinition {
  type: FieldType;
  label: string;
  description: string;
  icon: string; // MUI icon name
}

export const FIELD_REGISTRY: FieldDefinition[] = [
  {
    type: 'text',
    label: 'Text Input',
    description: 'Single line text input field',
    icon: 'TextFields',
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'Multi-line text input field',
    icon: 'Notes',
  },
  {
    type: 'select',
    label: 'Select',
    description: 'Dropdown selection field',
    icon: 'ArrowDropDown',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker field',
    icon: 'CalendarToday',
  },
  {
    type: 'datetime',
    label: 'DateTime',
    description: 'Date and time picker field',
    icon: 'AccessTime',
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    description: 'Single-choice options',
    icon: 'RadioButtonChecked',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Checkbox input field',
    icon: 'CheckBox',
  },
  {
    type: 'file',
    label: 'File Upload',
    description: 'File upload field',
    icon: 'AttachFile',
  },
];

export function getFieldDefinition(
  type: FieldType
): FieldDefinition | undefined {
  return FIELD_REGISTRY.find((def) => def.type === type);
}
