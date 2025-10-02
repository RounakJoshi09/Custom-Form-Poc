import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FormSchema } from '@/lib/schema';
import { SavedFormSummary } from '@/lib/persistence';

const FORMS_DIR = path.join(process.cwd(), 'data', 'forms');

// Ensure forms directory exists
async function ensureFormsDir() {
  try {
    await fs.access(FORMS_DIR);
  } catch {
    await fs.mkdir(FORMS_DIR, { recursive: true });
  }
}

// GET /api/forms - List all forms
export async function GET() {
  try {
    await ensureFormsDir();
    
    const files = await fs.readdir(FORMS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const forms: SavedFormSummary[] = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(FORMS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const schema: FormSchema = JSON.parse(content);
        
        forms.push({
          id: schema.metadata.id,
          name: schema.metadata.name,
          description: schema.metadata.description,
          updatedAt: schema.metadata.updatedAt,
        });
      } catch (error) {
        console.error(`Error reading form file ${file}:`, error);
        // Skip corrupted files
      }
    }
    
    // Sort by updated date (newest first)
    forms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error listing forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    await ensureFormsDir();
    
    const schema: FormSchema = await request.json();
    
    // Validate required fields
    if (!schema.metadata?.id || !schema.metadata?.name) {
      return NextResponse.json({ error: 'Invalid form schema' }, { status: 400 });
    }
    
    const filePath = path.join(FORMS_DIR, `${schema.metadata.id}.json`);
    
    // Check if form already exists
    try {
      await fs.access(filePath);
      return NextResponse.json({ error: 'Form already exists' }, { status: 409 });
    } catch {
      // File doesn't exist, which is what we want
    }
    
    // Save the form
    await fs.writeFile(filePath, JSON.stringify(schema, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}