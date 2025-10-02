import { FormSchema } from './schema';

export interface SavedFormSummary {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
}

// API client functions
export async function saveForm(
  schema: FormSchema
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schema),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save form' };
  }
}

export async function updateForm(
  schema: FormSchema
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/forms/${schema.metadata.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schema),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update form' };
  }
}

export async function loadForm(
  id: string
): Promise<{ schema?: FormSchema; error?: string }> {
  try {
    const response = await fetch(`/api/forms/${id}`);

    if (!response.ok) {
      return { error: 'Form not found' };
    }

    const schema = await response.json();
    return { schema };
  } catch (error) {
    return { error: 'Failed to load form' };
  }
}

export async function listForms(): Promise<{
  forms?: SavedFormSummary[];
  error?: string;
}> {
  try {
    const response = await fetch('/api/forms');

    if (!response.ok) {
      return { error: 'Failed to fetch forms' };
    }

    const forms = await response.json();
    return { forms };
  } catch (error) {
    return { error: 'Failed to load forms list' };
  }
}

export async function deleteForm(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/forms/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete form' };
  }
}
