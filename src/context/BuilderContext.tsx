'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BuilderState,
  FormSchema,
  FormField,
  FieldType,
  LayoutType,
  FieldPosition,
  SectionConfig,
} from '@/lib/schema';
import { 
  createLayoutConfig, 
  findNextPosition, 
  isPositionOccupied, 
  createSection,
  getSections,
  getSectionById 
} from '@/lib/layout';

// Action types
type BuilderAction =
  | { type: 'SET_SCHEMA'; payload: FormSchema }
  | { type: 'LOAD_SCHEMA'; payload: FormSchema }
  | { type: 'SET_LAYOUT'; payload: LayoutType }
  | { type: 'ADD_FIELD'; payload: { fieldType: FieldType; columnId?: string; sectionId?: string; position?: FieldPosition } }
  | { type: 'REMOVE_FIELD'; payload: string }
  | {
    type: 'MOVE_FIELD';
    payload: { fieldId: string; position: FieldPosition };
  }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | {
    type: 'UPDATE_FIELD_PROPS';
    payload: { fieldId: string; props: Partial<FormField['props']> };
  }
  | {
    type: 'UPDATE_FIELD_VALIDATION';
    payload: {
      fieldId: string;
      validation: Partial<FormField['validation']>;
    };
  }
  | { type: 'SET_DRAGGED_FIELD'; payload: string | null }
  | { type: 'UPDATE_FORM_METADATA'; payload: Partial<FormSchema['metadata']> }
  | { type: 'UPDATE_COLUMN_SECTION_NAME'; payload: { columnId: string; sectionName: string } }
  // Section-related actions
  | { type: 'ADD_SECTION'; payload: { columnId: string } }
  | { type: 'REMOVE_SECTION'; payload: { columnId: string; sectionId: string } }
  | { type: 'RENAME_SECTION'; payload: { columnId: string; sectionId: string; name: string } }
  | { type: 'SET_TABIFY'; payload: boolean };

// Create initial state
function createInitialState(): BuilderState {
  const schemaId = uuidv4();
  const now = new Date().toISOString();

  return {
    schema: {
      metadata: {
        id: schemaId,
        name: 'Untitled Form',
        description: '',
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      layout: createLayoutConfig('50-50'),
      fields: [],
      positions: {},
    },
    selectedFieldId: null,
    draggedFieldId: null,
  };
}

// Reducer function
function builderReducer(
  state: BuilderState,
  action: BuilderAction
): BuilderState {
  switch (action.type) {
    case 'SET_SCHEMA':
    case 'LOAD_SCHEMA':
      return {
        ...state,
        schema: action.payload,
        selectedFieldId: null,
        draggedFieldId: null,
      };

    case 'SET_LAYOUT': {
      const newLayout = createLayoutConfig(action.payload);
      return {
        ...state,
        schema: {
          ...state.schema,
          layout: newLayout,
          // Clear positions when layout changes - fields will need to be repositioned
          positions: {},
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'ADD_FIELD': {
      const fieldId = uuidv4();
      const fieldKey = `field_${Date.now()}`;

      let position: FieldPosition;

      if (action.payload.position) {
        // Use specific position if provided
        position = action.payload.position;

        // For new fields, check if position is occupied
        const isOccupied = isPositionOccupied(position, state.schema.positions);
        if (isOccupied) {
          // Position is occupied, find next available position in the same column/section
          const nextPosition = findNextPosition(
            position.columnId,
            state.schema.layout,
            state.schema.positions,
            position.sectionId
          );
          if (!nextPosition) {
            // No space available in this column/section
            return state;
          }
          position = nextPosition;
        }
      } else {
        // Find target column (first column if not specified)
        const targetColumnId =
          action.payload.columnId || state.schema.layout.columns[0].id;
        const targetSectionId = action.payload.sectionId;

        // Find next available position
        const nextPosition = findNextPosition(
          targetColumnId,
          state.schema.layout,
          state.schema.positions,
          targetSectionId
        );
        if (!nextPosition) {
          // No space available
          return state;
        }
        position = nextPosition;
      }

      const newField: FormField = {
        id: fieldId,
        type: action.payload.fieldType,
        key: fieldKey,
        props: {
          label: `New ${action.payload.fieldType} field`,
          placeholder: '',
          helperText: '',
        },
        validation: {
          required: false,
        },
      };

      return {
        ...state,
        schema: {
          ...state.schema,
          fields: [...state.schema.fields, newField],
          positions: {
            ...state.schema.positions,
            [fieldId]: position,
          },
          updatedAt: new Date().toISOString(),
        },
        selectedFieldId: fieldId,
      };
    }

    case 'REMOVE_FIELD': {
      const fieldId = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          fields: state.schema.fields.filter((f) => f.id !== fieldId),
          positions: Object.fromEntries(
            Object.entries(state.schema.positions).filter(
              ([id]) => id !== fieldId
            )
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedFieldId:
          state.selectedFieldId === fieldId ? null : state.selectedFieldId,
      };
    }

    case 'MOVE_FIELD': {
      const { fieldId, position } = action.payload;
      const currentPositions = state.schema.positions;

      // Check if target position is occupied by another field
      const fieldAtTargetPosition = Object.entries(currentPositions).find(
        ([otherFieldId, pos]: [string, FieldPosition]) =>
          otherFieldId !== fieldId &&
          pos.columnId === position.columnId &&
          pos.rowIndex === position.rowIndex &&
          pos.slotIndex === position.slotIndex
      );

      const newPositions = { ...currentPositions };

      if (fieldAtTargetPosition) {
        // If position is occupied, swap the fields
        const [occupyingFieldId] = fieldAtTargetPosition;
        const currentFieldPosition = currentPositions[fieldId];

        newPositions[fieldId] = position;
        newPositions[occupyingFieldId] = currentFieldPosition;
      } else {
        // Target position is free, simply move the field
        newPositions[fieldId] = position;
      }

      return {
        ...state,
        schema: {
          ...state.schema,
          positions: newPositions,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'SELECT_FIELD':
      return {
        ...state,
        selectedFieldId: action.payload,
      };

    case 'UPDATE_FIELD_PROPS': {
      const { fieldId, props } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          fields: state.schema.fields.map((field) =>
            field.id === fieldId
              ? { ...field, props: { ...field.props, ...props } }
              : field
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'UPDATE_FIELD_VALIDATION': {
      const { fieldId, validation } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          fields: state.schema.fields.map((field) =>
            field.id === fieldId
              ? { ...field, validation: { ...field.validation, ...validation } }
              : field
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'SET_DRAGGED_FIELD':
      return {
        ...state,
        draggedFieldId: action.payload,
      };

    case 'UPDATE_FORM_METADATA': {
      return {
        ...state,
        schema: {
          ...state.schema,
          metadata: {
            ...state.schema.metadata,
            ...action.payload,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'UPDATE_COLUMN_SECTION_NAME': {
      const { columnId, sectionName } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          layout: {
            ...state.schema.layout,
            columns: state.schema.layout.columns.map((column) =>
              column.id === columnId
                ? { ...column, sectionName: sectionName || undefined }
                : column
            ),
          },
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'ADD_SECTION': {
      const { columnId } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          layout: {
            ...state.schema.layout,
            columns: state.schema.layout.columns.map((column) => {
              if (column.id === columnId && column.width === 100) {
                const currentSections = column.sections || [];
                const newSectionNumber = currentSections.length + 1;
                const newSection = createSection(`Section ${newSectionNumber}`);
                return {
                  ...column,
                  sections: [...currentSections, newSection],
                };
              }
              return column;
            }),
          },
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'REMOVE_SECTION': {
      const { columnId, sectionId } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          layout: {
            ...state.schema.layout,
            columns: state.schema.layout.columns.map((column) => {
              if (column.id === columnId && column.sections) {
                return {
                  ...column,
                  sections: column.sections.filter((section) => section.id !== sectionId),
                };
              }
              return column;
            }),
          },
          // Also remove all fields in this section
          positions: Object.fromEntries(
            Object.entries(state.schema.positions).filter(
              ([_, position]) => position.sectionId !== sectionId
            )
          ),
          fields: state.schema.fields.filter((field) => {
            const position = state.schema.positions[field.id];
            return !position || position.sectionId !== sectionId;
          }),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'RENAME_SECTION': {
      const { columnId, sectionId, name } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          layout: {
            ...state.schema.layout,
            columns: state.schema.layout.columns.map((column) => {
              if (column.id === columnId && column.sections) {
                return {
                  ...column,
                  sections: column.sections.map((section) =>
                    section.id === sectionId ? { ...section, name } : section
                  ),
                };
              }
              return column;
            }),
          },
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'SET_TABIFY': {
      return {
        ...state,
        schema: {
          ...state.schema,
          layout: {
            ...state.schema.layout,
            tabify: action.payload,
          },
          updatedAt: new Date().toISOString(),
        },
      };
    }

    default:
      return state;
  }
}

// Context type
interface BuilderContextType {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  actions: {
    setSchema: (schema: FormSchema) => void;
    setLayout: (layout: LayoutType) => void;
    addField: (fieldType: FieldType, columnId?: string, sectionId?: string, position?: FieldPosition) => void;
    removeField: (fieldId: string) => void;
    moveField: (fieldId: string, position: FieldPosition) => void;
    selectField: (fieldId: string | null) => void;
    updateFieldProps: (
      fieldId: string,
      props: Partial<FormField['props']>
    ) => void;
    updateFieldValidation: (
      fieldId: string,
      validation: Partial<FormField['validation']>
    ) => void;
    setDraggedField: (fieldId: string | null) => void;
    updateFormMetadata: (metadata: Partial<FormSchema['metadata']>) => void;
    updateColumnSectionName: (columnId: string, sectionName: string) => void;
    // Section actions
    addSection: (columnId: string) => void;
    removeSection: (columnId: string, sectionId: string) => void;
    renameSection: (columnId: string, sectionId: string, name: string) => void;
    setTabify: (tabify: boolean) => void;
  };
}

// Create context
const BuilderContext = createContext<BuilderContextType | null>(null);

// Provider component
export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    builderReducer,
    undefined,
    createInitialState
  );

  const actions = {
    setSchema: useCallback((schema: FormSchema) => {
      dispatch({ type: 'SET_SCHEMA', payload: schema });
    }, []),

    setLayout: useCallback((layout: LayoutType) => {
      dispatch({ type: 'SET_LAYOUT', payload: layout });
    }, []),

    addField: useCallback((fieldType: FieldType, columnId?: string, sectionId?: string, position?: FieldPosition) => {
      dispatch({ type: 'ADD_FIELD', payload: { fieldType, columnId, sectionId, position } });
    }, []),

    removeField: useCallback((fieldId: string) => {
      dispatch({ type: 'REMOVE_FIELD', payload: fieldId });
    }, []),

    moveField: useCallback((fieldId: string, position: FieldPosition) => {
      dispatch({ type: 'MOVE_FIELD', payload: { fieldId, position } });
    }, []),

    selectField: useCallback((fieldId: string | null) => {
      dispatch({ type: 'SELECT_FIELD', payload: fieldId });
    }, []),

    updateFieldProps: useCallback(
      (fieldId: string, props: Partial<FormField['props']>) => {
        dispatch({ type: 'UPDATE_FIELD_PROPS', payload: { fieldId, props } });
      },
      []
    ),

    updateFieldValidation: useCallback(
      (fieldId: string, validation: Partial<FormField['validation']>) => {
        dispatch({
          type: 'UPDATE_FIELD_VALIDATION',
          payload: { fieldId, validation },
        });
      },
      []
    ),

    setDraggedField: useCallback((fieldId: string | null) => {
      dispatch({ type: 'SET_DRAGGED_FIELD', payload: fieldId });
    }, []),

    updateFormMetadata: useCallback(
      (metadata: Partial<FormSchema['metadata']>) => {
        dispatch({ type: 'UPDATE_FORM_METADATA', payload: metadata });
      },
      []
    ),

    updateColumnSectionName: useCallback(
      (columnId: string, sectionName: string) => {
        dispatch({ type: 'UPDATE_COLUMN_SECTION_NAME', payload: { columnId, sectionName } });
      },
      []
    ),

    addSection: useCallback((columnId: string) => {
      dispatch({ type: 'ADD_SECTION', payload: { columnId } });
    }, []),

    removeSection: useCallback((columnId: string, sectionId: string) => {
      dispatch({ type: 'REMOVE_SECTION', payload: { columnId, sectionId } });
    }, []),

    renameSection: useCallback((columnId: string, sectionId: string, name: string) => {
      dispatch({ type: 'RENAME_SECTION', payload: { columnId, sectionId, name } });
    }, []),

    setTabify: useCallback((tabify: boolean) => {
      dispatch({ type: 'SET_TABIFY', payload: tabify });
    }, []),
  };

  return (
    <BuilderContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </BuilderContext.Provider>
  );
}

// Hook to use the builder context
export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
