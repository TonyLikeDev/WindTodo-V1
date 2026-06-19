import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import mammoth from 'mammoth';
import { auth } from '@/lib/auth';
import { groq, GROQ_MODEL } from '@/lib/groq';

// Vision OCR + extraction can take a few seconds; give the function headroom.
export const runtime = 'nodejs';
export const maxDuration = 60;

// Groq caps base64-encoded images at 4 MB per request. Encoding inflates raw
// bytes ~33%, so a ~3 MB photo lands near that ceiling.
const IMAGE_RAW_MAX = 4 * 1024 * 1024; // hard guard before we even encode
const IMAGE_B64_MAX = 4 * 1024 * 1024; // Groq's actual limit
const PDF_RAW_MAX = 15 * 1024 * 1024;
const DOCX_RAW_MAX = 15 * 1024 * 1024;
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const TYPES = ['TASK', 'STORY', 'BUG'] as const;

export type ExtractedTask = {
  title: string;
  description?: string;
  priority?: (typeof PRIORITIES)[number];
  type?: (typeof TYPES)[number];
};

const TASKS_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short, imperative task title' },
          description: { type: 'string', description: 'Optional extra detail' },
          priority: { type: 'string', enum: PRIORITIES as unknown as string[] },
          type: { type: 'string', enum: TYPES as unknown as string[] },
        },
        required: ['title'],
        additionalProperties: false,
      },
    },
  },
  required: ['tasks'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = [
  'You turn raw notes into a clean to-do list.',
  'Extract every actionable item as its own task. Keep each `title` short and imperative',
  '(e.g. "Email the dentist", not "I need to email the dentist tomorrow morning").',
  'Put any supporting detail in `description`. Only set `priority` (LOW|MEDIUM|HIGH|URGENT)',
  'or `type` (TASK|STORY|BUG) when the note clearly implies it; otherwise omit them.',
  'Ignore headings, greetings, dates, and non-actionable prose. If there are no tasks,',
  'return an empty list. Respond with JSON matching the schema only.',
].join(' ');

function normalize(raw: unknown): ExtractedTask[] {
  const tasks = (raw as { tasks?: unknown })?.tasks;
  if (!Array.isArray(tasks)) return [];
  const out: ExtractedTask[] = [];
  for (const t of tasks) {
    if (!t || typeof (t as { title?: unknown }).title !== 'string') continue;
    const title = (t as { title: string }).title.trim().slice(0, 200);
    if (!title) continue;
    const item: ExtractedTask = { title };
    const desc = (t as { description?: unknown }).description;
    if (typeof desc === 'string' && desc.trim()) item.description = desc.trim().slice(0, 2000);
    const pri = (t as { priority?: unknown }).priority;
    if (typeof pri === 'string' && (PRIORITIES as readonly string[]).includes(pri.toUpperCase())) {
      item.priority = pri.toUpperCase() as ExtractedTask['priority'];
    }
    const typ = (t as { type?: unknown }).type;
    if (typeof typ === 'string' && (TYPES as readonly string[]).includes(typ.toUpperCase())) {
      item.type = typ.toUpperCase() as ExtractedTask['type'];
    }
    out.push(item);
    if (out.length >= 50) break;
  }
  return out;
}

export async function POST(request: NextRequest) {
  if (!groq) {
    return NextResponse.json(
      { error: 'AI import is not configured (missing GROQ_API_KEY).' },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const text = (form.get('text') as string | null)?.trim() || '';
  const file = form.get('file') as File | null;

  // Build the user message content from whichever input was provided.
  let userContent: string | Array<Record<string, unknown>>;

  if (file) {
    const mime = file.type || '';
    if (mime.startsWith('image/')) {
      if (file.size > IMAGE_RAW_MAX) {
        return NextResponse.json(
          { error: 'Image too large — please use a photo under ~3 MB.' },
          { status: 413 },
        );
      }
      const b64 = Buffer.from(await file.arrayBuffer()).toString('base64');
      if (b64.length > IMAGE_B64_MAX) {
        return NextResponse.json(
          { error: 'Image too large — please use a photo under ~3 MB.' },
          { status: 413 },
        );
      }
      userContent = [
        { type: 'text', text: 'Extract a to-do list from this note image.' },
        { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } },
      ];
    } else if (mime === 'application/pdf') {
      if (file.size > PDF_RAW_MAX) {
        return NextResponse.json({ error: 'PDF too large (max 15 MB).' }, { status: 413 });
      }
      let pdfText = '';
      try {
        const { text: extracted } = await extractText(
          new Uint8Array(await file.arrayBuffer()),
          { mergePages: true },
        );
        pdfText = (extracted || '').trim();
      } catch {
        return NextResponse.json({ error: 'Could not read this PDF.' }, { status: 422 });
      }
      if (pdfText.length < 10) {
        return NextResponse.json(
          {
            error:
              "No readable text in this PDF (scanned PDFs aren't supported — upload a photo instead).",
          },
          { status: 422 },
        );
      }
      userContent = `Notes:\n\n${pdfText.slice(0, 20000)}`;
    } else if (mime === DOCX_MIME || /\.docx$/i.test(file.name)) {
      if (file.size > DOCX_RAW_MAX) {
        return NextResponse.json({ error: 'Document too large (max 15 MB).' }, { status: 413 });
      }
      let docText = '';
      try {
        const { value } = await mammoth.extractRawText({
          buffer: Buffer.from(await file.arrayBuffer()),
        });
        docText = (value || '').trim();
      } catch {
        return NextResponse.json({ error: 'Could not read this Word document.' }, { status: 422 });
      }
      if (docText.length < 10) {
        return NextResponse.json({ error: 'No readable text in this document.' }, { status: 422 });
      }
      userContent = `Notes:\n\n${docText.slice(0, 20000)}`;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload an image, PDF, or Word (.docx) file.' },
        { status: 400 },
      );
    }
  } else if (text) {
    userContent = `Notes:\n\n${text.slice(0, 20000)}`;
  } else {
    return NextResponse.json({ error: 'Provide a note image, PDF, or text.' }, { status: 400 });
  }

  let content: string | null = null;
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 2048,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'extracted_tasks', strict: false, schema: TASKS_SCHEMA },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { role: 'user', content: userContent as any },
      ],
    });
    content = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    const status = (err as { status?: number })?.status;
    const msg =
      status === 429
        ? 'AI is busy right now — please try again in a moment.'
        : 'AI extraction failed. Please try again.';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content ?? '{}');
  } catch {
    return NextResponse.json({ error: 'AI returned an unreadable response.' }, { status: 502 });
  }

  const tasks = normalize(parsed);
  if (tasks.length === 0) {
    return NextResponse.json(
      { error: 'No tasks found in those notes. Try a clearer photo or add more detail.' },
      { status: 422 },
    );
  }

  return NextResponse.json({ tasks });
}
