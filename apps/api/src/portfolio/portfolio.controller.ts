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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // Public: get active portfolio items
  @Get('public')
  findAllPublic() {
    return this.portfolioService.findAllActive();
  }

  // Admin: list all portfolio items
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.portfolioService.findAll();
  }

  // Admin: get single item
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfolioService.findOne(+id);
  }

  // Admin: create item
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreatePortfolioItemDto) {
    return this.portfolioService.create(dto);
  }

  // Admin: update item
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePortfolioItemDto) {
    return this.portfolioService.update(+id, dto);
  }

  // Admin: toggle active status
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.portfolioService.toggleActive(+id);
  }

  // Admin: delete item
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfolioService.remove(+id);
  }

  // One-time seed endpoint (secret-protected)
  @Post('seed')
  async seed(@Body() body: { secret: string }) {
    const seedSecret = process.env.SEED_SECRET || 'setup-service-2026';
    if (body.secret !== seedSecret) {
      return { message: 'Invalid secret' };
    }
    const existing = await this.portfolioService.findAll();
    if (existing.length > 0) {
      return { message: `Portfolio already has ${existing.length} items, skipping.` };
    }
    const items = [
      { title: 'AI-Integrated Website Demo', description: 'A documentary-style showcase of our AI-powered website platform — from intelligent content generation to automated customer interactions.', media_url: '/videos/portfolio/ai-documentary-intro.mp4', media_type: 'video', category: 'AI Website', sort_order: 1, is_active: true },
      { title: 'Workflow Automation System', description: 'See how AI automates repetitive business tasks — scheduling, data entry, email sorting, and report generation — saving hours every day.', media_url: '/videos/portfolio/ai-workflow-automation.mp4', media_type: 'video', category: 'Automation', sort_order: 2, is_active: true },
      { title: 'Smart AI Assistant Setup', description: 'Watch a complete private AI assistant being configured on a local machine — from installation to first conversation, fully offline and secure.', media_url: '/videos/portfolio/ai-smart-assistant.mp4', media_type: 'video', category: 'AI Setup', sort_order: 3, is_active: true },
      { title: 'AI-Powered Data Analysis', description: 'Demonstration of AI analyzing business data in real-time — extracting insights, generating charts, and making actionable recommendations automatically.', media_url: '/videos/portfolio/ai-data-analysis.mp4', media_type: 'video', category: 'Data Analysis', sort_order: 4, is_active: true },
      { title: 'AI Customer Service Bot', description: 'A smart customer service bot handling inquiries 24/7 — answering FAQs, routing tickets, and escalating complex issues to human agents seamlessly.', media_url: '/videos/portfolio/ai-customer-service.mp4', media_type: 'video', category: 'Customer Service', sort_order: 5, is_active: true },
    ];
    const created = [];
    for (const item of items) {
      created.push(await this.portfolioService.create(item as any));
    }
    return { message: `Seeded ${created.length} portfolio items`, items: created };
  }
}
