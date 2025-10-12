import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FormSchema } from '@/lib/schema';

const FORMS_DIR = path.join(process.cwd(), 'data', 'forms');
const SUBMISSIONS_DIR = path.join(process.cwd(), 'data', 'submissions');

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Ensure submissions directory exists
async function ensureSubmissionsDir() {
  try {
    await fs.access(SUBMISSIONS_DIR);
  } catch {
    await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });
  }
}

// GET /api/forms/[id]/submissions - Get all submissions for a form
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    await ensureSubmissionsDir();

    const formSubmissionsDir = path.join(SUBMISSIONS_DIR, id);

    try {
      await fs.access(formSubmissionsDir);
    } catch {
      // No submissions directory exists yet
      return NextResponse.json([]);
    }

    const files = await fs.readdir(formSubmissionsDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    const submissions = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(formSubmissionsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const submission = JSON.parse(content);
        submissions.push(submission);
      } catch (error) {
        console.error(`Error reading submission file ${file}:`, error);
        // Skip corrupted files
      }
    }

    // Sort by submission date (newest first)
    submissions.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error getting submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/forms/[id]/submissions - Submit form data
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // First, verify the form exists
    const formFilePath = path.join(FORMS_DIR, `${id}.json`);
    let formSchema: FormSchema;

    try {
      const formContent = await fs.readFile(formFilePath, 'utf-8');
      formSchema = JSON.parse(formContent);
    } catch (error) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const submissionData = await request.json();

    // Validate submission data against form schema
    const validationErrors: Record<string, string> = {};

    for (const field of formSchema.fields) {
      const value = submissionData[field.key];

      if (field.validation.required) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          validationErrors[field.key] = 'This field is required';
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    await ensureSubmissionsDir();

    const formSubmissionsDir = path.join(SUBMISSIONS_DIR, id);
    await fs.mkdir(formSubmissionsDir, { recursive: true });

    // Create submission record
    const submission = {
      id: crypto.randomUUID(),
      formId: id,
      formName: formSchema.metadata.name,
      data: submissionData,
      submittedAt: new Date().toISOString(),
    };

    const submissionFilePath = path.join(
      formSubmissionsDir,
      `${submission.id}.json`
    );

    await fs.writeFile(submissionFilePath, JSON.stringify(submission, null, 2));

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
