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
} from '@/lib/schema';
import { createLayoutConfig, findNextPosition } from '@/lib/layout';

// Action types
type BuilderAction =
  | { type: 'SET_SCHEMA'; payload: FormSchema }
  | { type: 'SET_LAYOUT'; payload: LayoutType }
  | { type: 'ADD_FIELD'; payload: { fieldType: FieldType; columnId?: string } }
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
  | { type: 'UPDATE_FORM_METADATA'; payload: Partial<FormSchema['metadata']> };

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

      // Find target column (first column if not specified)
      const targetColumnId =
        action.payload.columnId || state.schema.layout.columns[0].id;

      // Find next available position
      const position = findNextPosition(
        targetColumnId,
        state.schema.layout,
        state.schema.positions
      );
      if (!position) {
        // No space available
        return state;
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
      return {
        ...state,
        schema: {
          ...state.schema,
          positions: {
            ...state.schema.positions,
            [fieldId]: position,
          },
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

    default:
      return state;
  }
}

// Context type
interface BuilderContextType {
  state: BuilderState;
  actions: {
    setSchema: (schema: FormSchema) => void;
    setLayout: (layout: LayoutType) => void;
    addField: (fieldType: FieldType, columnId?: string) => void;
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

    addField: useCallback((fieldType: FieldType, columnId?: string) => {
      dispatch({ type: 'ADD_FIELD', payload: { fieldType, columnId } });
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
  };

  return (
    <BuilderContext.Provider value={{ state, actions }}>
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
