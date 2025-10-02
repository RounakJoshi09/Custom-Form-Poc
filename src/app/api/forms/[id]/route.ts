import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FormSchema } from '@/lib/schema';

const FORMS_DIR = path.join(process.cwd(), 'data', 'forms');

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/forms/[id] - Get a specific form
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    const filePath = path.join(FORMS_DIR, `${id}.json`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const schema: FormSchema = JSON.parse(content);
      return NextResponse.json(schema);
    } catch (error) {
      console.error(`Error reading form ${id}:`, error);
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error getting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    const schema: FormSchema = await request.json();
    
    // Validate that the ID in the schema matches the URL parameter
    if (schema.metadata?.id !== id) {
      return NextResponse.json({ error: 'Form ID mismatch' }, { status: 400 });
    }
    
    // Validate required fields
    if (!schema.metadata?.name) {
      return NextResponse.json({ error: 'Invalid form schema' }, { status: 400 });
    }
    
    const filePath = path.join(FORMS_DIR, `${id}.json`);
    
    // Update the updatedAt timestamp
    schema.metadata.updatedAt = new Date().toISOString();
    
    // Save the form
    await fs.writeFile(filePath, JSON.stringify(schema, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    const filePath = path.join(FORMS_DIR, `${id}.json`);
    
    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`Error deleting form ${id}:`, error);
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}