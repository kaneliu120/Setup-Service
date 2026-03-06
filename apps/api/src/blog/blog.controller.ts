import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public: get published posts
  @Get('public')
  findAllPublished() {
    return this.blogService.findAllPublished();
  }

  // Public: get single post by slug
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // Admin: list all posts
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  // Admin: get single post
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  // Admin: create post
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  // Admin: update post
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(+id, dto);
  }

  // Admin: toggle published status
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle')
  togglePublished(@Param('id') id: string) {
    return this.blogService.togglePublished(+id);
  }

  // Admin: delete post
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }

  // One-time seed endpoint (secret-protected)
  @Post('seed')
  async seed(@Body() body: { secret: string }) {
    const seedSecret = process.env.SEED_SECRET || 'setup-service-2026';
    if (body.secret !== seedSecret) {
      return { message: 'Invalid secret' };
    }
    const existing = await this.blogService.findAll();
    if (existing.length > 0) {
      return { message: `Blog already has ${existing.length} posts, skipping.` };
    }
    const posts = [
      {
        slug: 'ai-email-management-save-2-hours-daily',
        title: '5 Ways AI Email Management Can Save You 2 Hours Every Day',
        excerpt: 'Discover how AI-powered email tools can automatically sort, prioritize, draft replies, and schedule follow-ups — reclaiming over 2 hours of your workday.',
        content: '<h2>The Email Overload Problem</h2><p>The average professional spends <strong>2.5 hours per day</strong> managing email. That\'s over 600 hours per year — nearly 15 full work weeks. AI can take most of that burden off your shoulders.</p><h2>1. Smart Inbox Prioritization</h2><p>AI learns which emails matter most to you. It moves newsletters to a digest folder, flags urgent client messages, and surfaces action items automatically. No more scrolling through 50+ unread messages every morning.</p><h2>2. Automated Draft Replies</h2><p>When a client asks a routine question, AI prepares a professional reply in seconds. You review, tweak if needed, and hit send. What used to take 5 minutes now takes 30 seconds.</p><h2>3. Meeting Summary & Follow-ups</h2><p>After every meeting, AI generates a summary and drafts follow-up emails to all participants. Action items are automatically extracted and added to your task list.</p><h2>4. Smart Scheduling</h2><p>Instead of the back-and-forth of "What time works for you?", AI reads your calendar and proposes available slots directly in your reply. Scheduling meetings drops from 10 emails to 1.</p><h2>5. Unsubscribe & Clean-up</h2><p>AI identifies newsletters you never read and offers to unsubscribe. It also archives old conversations and removes duplicates, keeping your inbox lean and focused.</p><h2>Getting Started</h2><p>You don\'t need to switch email providers. Modern AI assistants integrate with Gmail, Outlook, and other platforms through simple setup. The key is starting with one feature — like smart prioritization — and expanding from there.</p><p><strong>Ready to reclaim your time?</strong> Contact us to set up an AI email assistant tailored to your workflow.</p>',
        author: 'Kane', tags: ['AI', 'Email', 'Productivity', 'Automation'], is_published: true,
      },
      {
        slug: 'automate-repetitive-tasks-with-ai',
        title: 'How to Automate Your Most Repetitive Tasks with AI in 2026',
        excerpt: 'From data entry to report generation, learn which daily tasks AI can handle autonomously — and how to set up automation that actually works.',
        content: '<h2>The Hidden Cost of Repetitive Work</h2><p>Studies show that knowledge workers spend <strong>40% of their time</strong> on repetitive tasks that could be automated. That\'s nearly half your workday doing things a machine could handle better and faster.</p><h2>Tasks AI Handles Best</h2><h3>Data Entry & Formatting</h3><p>AI can extract data from invoices, receipts, and documents, then enter it into your spreadsheets or accounting software. What takes a human 30 minutes, AI does in under 2 minutes with higher accuracy.</p><h3>Report Generation</h3><p>Feed AI your raw data and it produces formatted reports with charts, summaries, and trend analysis. Weekly reports that used to take Friday afternoon now generate automatically by Monday morning.</p><h3>File Organization</h3><p>AI monitors your downloads and documents folder, automatically sorting files by project, client, or type. It can rename files with consistent conventions and move them to the right folders.</p><h3>Social Media Scheduling</h3><p>AI analyzes your best-performing posts, suggests content ideas, and schedules posts at optimal times across all platforms. You approve the content; AI handles the logistics.</p><h2>Building Your First Automation</h2><p>Start with one workflow that frustrates you most. Map out the steps, identify the decision points, and let AI handle everything between the first trigger and the final output. Most automations pay for themselves within the first week.</p><h2>The ROI of AI Automation</h2><p>Our clients typically save <strong>10-15 hours per week</strong> after setting up just 3-4 core automations. That\'s not just time saved — it\'s mental energy freed up for creative, strategic work that actually grows your business.</p>',
        author: 'Kane', tags: ['AI', 'Automation', 'Productivity', 'Business'], is_published: true,
      },
      {
        slug: 'private-ai-assistant-vs-chatgpt',
        title: 'Private AI Assistant vs ChatGPT: Why Local AI Is the Future of Productivity',
        excerpt: 'Compare cloud-based AI like ChatGPT with private, locally-hosted AI assistants — and discover why privacy-first AI delivers better results for serious work.',
        content: '<h2>The Rise of Private AI</h2><p>ChatGPT changed the world, but it has limitations that matter for professionals: your data goes to external servers, responses are generic, and you\'re dependent on internet connectivity. Private AI solves all three problems.</p><h2>Speed & Availability</h2><p>A local AI assistant responds in milliseconds, not seconds. There\'s no "ChatGPT is at capacity" message. No outages during critical deadlines. Your AI is always available, even on an airplane.</p><h2>Data Privacy & Security</h2><p>When you paste confidential contracts, financial data, or personal information into ChatGPT, that data travels to OpenAI\'s servers. With a private AI, your data <strong>never leaves your machine</strong>. For lawyers, accountants, and healthcare professionals, this isn\'t optional — it\'s mandatory.</p><h2>Customization & Context</h2><p>Unlike generic ChatGPT, a private AI can be fine-tuned on your documents, company knowledge base, and communication style. It understands your industry jargon, knows your clients by name, and maintains context across conversations.</p><h2>Cost Comparison</h2><table style="width:100%;border-collapse:collapse;margin:20px 0;"><tr style="border-bottom:2px solid #e2e8f0;"><th style="text-align:left;padding:12px;">Feature</th><th style="text-align:left;padding:12px;">ChatGPT Plus</th><th style="text-align:left;padding:12px;">Private AI</th></tr><tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px;">Monthly Cost</td><td style="padding:12px;">$20/month ($240/year)</td><td style="padding:12px;">One-time setup fee</td></tr><tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px;">Data Privacy</td><td style="padding:12px;">Data sent to cloud</td><td style="padding:12px;">100% local</td></tr><tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px;">Customization</td><td style="padding:12px;">Limited</td><td style="padding:12px;">Full control</td></tr><tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px;">Internet Required</td><td style="padding:12px;">Yes</td><td style="padding:12px;">No</td></tr><tr><td style="padding:12px;">Usage Limits</td><td style="padding:12px;">Rate limited</td><td style="padding:12px;">Unlimited</td></tr></table><h2>Who Should Switch?</h2><p>If you handle sensitive data, need reliable availability, or want an AI that truly understands your business — a private AI assistant is worth the investment. It pays for itself within months through increased productivity alone.</p>',
        author: 'Kane', tags: ['AI', 'Privacy', 'ChatGPT', 'Comparison'], is_published: true,
      },
      {
        slug: 'ai-meeting-notes-action-items',
        title: 'Never Miss an Action Item Again: AI-Powered Meeting Notes That Actually Work',
        excerpt: 'Learn how AI can join your meetings, take perfect notes, extract action items, and send follow-up emails — all automatically.',
        content: '<h2>The Meeting Problem</h2><p>Professionals attend an average of <strong>11-15 meetings per week</strong>. After each one, critical action items get lost in handwritten notes, forgotten Slack messages, or simply fade from memory. AI changes this completely.</p><h2>How AI Meeting Assistants Work</h2><p>Modern AI meeting tools can:</p><ul><li><strong>Record and transcribe</strong> conversations in real-time with 95%+ accuracy</li><li><strong>Identify speakers</strong> and attribute quotes to the right person</li><li><strong>Extract action items</strong> with assigned owners and deadlines</li><li><strong>Generate summaries</strong> organized by topic, not chronologically</li><li><strong>Send follow-up emails</strong> to all participants automatically</li></ul><h2>Real-World Impact</h2><h3>Before AI:</h3><p>30-minute meeting → 15 minutes writing notes → action items scattered across 3 tools → 2 follow-up emails manually typed → someone still forgets their task.</p><h3>After AI:</h3><p>30-minute meeting → notes, action items, and follow-ups generated in 60 seconds → everyone gets a clear summary → tasks auto-added to project management tool.</p><h2>Privacy-First Meeting AI</h2><p>The best part? With a private AI setup, your meeting recordings and transcripts stay on your local machine. No cloud storage means no risk of confidential discussions being exposed.</p><h2>Getting Started in 3 Steps</h2><ol><li><strong>Set up your private AI</strong> with speech-to-text capabilities</li><li><strong>Connect to your calendar</strong> so AI knows when meetings start</li><li><strong>Configure output templates</strong> — choose where notes go (email, Notion, Google Docs, etc.)</li></ol><p>Stop spending your afternoons writing meeting notes. Let AI handle the busywork while you focus on the decisions that matter.</p>',
        author: 'Kane', tags: ['AI', 'Meetings', 'Productivity', 'Notes'], is_published: true,
      },
      {
        slug: 'ai-document-analysis-for-small-business',
        title: 'How Small Businesses Use AI to Process Documents 10x Faster',
        excerpt: 'From invoices to contracts, discover how AI document analysis helps small businesses process paperwork in minutes instead of hours.',
        content: '<h2>Drowning in Paperwork</h2><p>Small business owners spend an estimated <strong>120 hours per year</strong> on document management — sorting invoices, reviewing contracts, extracting data from forms, and filing paperwork. AI can reduce this to under 12 hours.</p><h2>What AI Document Analysis Can Do</h2><h3>Invoice Processing</h3><p>Drop a stack of invoices into a folder. AI reads each one, extracts the vendor name, amount, due date, and line items, then enters everything into your accounting software. 50 invoices processed in 3 minutes instead of 2 hours.</p><h3>Contract Review</h3><p>Before signing any contract, AI scans for unusual clauses, compares terms against your standards, and highlights anything that needs attention. It\'s like having a junior lawyer review every document for free.</p><h3>Receipt & Expense Tracking</h3><p>Snap a photo of a receipt. AI categorizes the expense, extracts the amount and date, and adds it to your expense report. At tax time, everything is already organized by category.</p><h3>Customer Form Processing</h3><p>Customer applications, feedback forms, and surveys get automatically processed. AI extracts structured data, identifies sentiment, and flags urgent issues for immediate attention.</p><h2>Local AI Advantage for Documents</h2><p>Processing business documents with cloud AI means sending your financial data, contracts, and customer information to external servers. With a local AI setup:</p><ul><li>Sensitive documents never leave your network</li><li>Processing speed is limited only by your hardware, not internet speed</li><li>No per-document API costs — process unlimited documents</li><li>Works offline for field operations and remote locations</li></ul><h2>ROI for Small Business</h2><p>A typical small business saves <strong>$3,000-5,000/year</strong> in time costs after setting up AI document processing. The one-time setup fee pays for itself within the first month.</p><p><strong>Ready to stop drowning in paperwork?</strong> Contact us to set up AI document processing for your business.</p>',
        author: 'Kane', tags: ['AI', 'Documents', 'Small Business', 'Efficiency'], is_published: true,
      },
    ];
    const created = [];
    for (const post of posts) {
      created.push(await this.blogService.create(post as any));
    }
    return { message: `Seeded ${created.length} blog posts`, posts: created.map(p => ({ id: p.id, slug: p.slug, title: p.title })) };
  }
}
