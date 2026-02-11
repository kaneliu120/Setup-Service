import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll() {
    return this.bookingRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.bookingRepository.findOne({ where: { id } });
  }

  async create(dto: CreateBookingDto) {
    const booking = this.bookingRepository.create({
      ...dto,
      appointment_time: new Date(dto.appointment_time),
    });
    const saved = await this.bookingRepository.save(booking);

    // Write to Obsidian vault asynchronously
    this.writeToObsidian(saved).catch(err =>
      console.error('Obsidian write failed:', err),
    );

    return saved;
  }

  async updateStatus(id: number, status: string) {
    await this.bookingRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.bookingRepository.delete(id);
  }

  private async writeToObsidian(booking: Booking) {
    const vaultPath =
      process.env.OBSIDIAN_VAULT_PATH ||
      path.join(process.env.HOME || '~', 'Obsidian Vault');

    const recordDir = path.join(vaultPath, '记录');

    if (!fs.existsSync(recordDir)) {
      fs.mkdirSync(recordDir, { recursive: true });
    }

    const dateStr = new Date(booking.appointment_time).toLocaleString('zh-CN', {
      timeZone: 'Asia/Manila',
    });
    const createdStr = new Date(booking.created_at).toLocaleString('zh-CN', {
      timeZone: 'Asia/Manila',
    });

    const content = `---
tags: [booking, landing-page]
created: ${createdStr}
status: ${booking.status}
---

# 预约 - ${booking.name}

- **称呼**: ${booking.name}
- **联系方式**: ${booking.contact} (${booking.contact_type || 'N/A'})
- **预约时间**: ${dateStr}
- **来源页面**: ${booking.source_slug || 'N/A'}
- **状态**: ${booking.status}

## 预约内容

${booking.content}

---
*自动记录于 ${createdStr}*
`;

    const fileName = `预约-${booking.name}-${booking.id}.md`;
    const filePath = path.join(recordDir, fileName);
    fs.writeFileSync(filePath, content, 'utf-8');

    // Try to open in Obsidian via URI scheme (non-blocking, safe)
    const obsidianUri = `obsidian://open?vault=Obsidian%20Vault&file=${encodeURIComponent('记录/' + fileName.replace('.md', ''))}`;
    execFile('open', [obsidianUri], () => {
      // Silent — don't fail if Obsidian isn't running
    });
  }

  async createConsultation(data: {
    message: string;
    contact?: string;
    source_slug?: string;
  }) {
    const booking = this.bookingRepository.create({
      name: data.contact || 'Anonymous',
      contact: data.contact || '',
      contact_type: 'email-form',
      appointment_time: new Date(),
      content: data.message,
      status: 'consultation',
      source_slug: data.source_slug,
    });
    const saved = await this.bookingRepository.save(booking);

    this.writeConsultationToObsidian(saved).catch(err =>
      console.error('Obsidian consultation write failed:', err),
    );

    return saved;
  }

  private async writeConsultationToObsidian(booking: Booking) {
    const vaultPath =
      process.env.OBSIDIAN_VAULT_PATH ||
      path.join(process.env.HOME || '~', 'Obsidian Vault');

    const recordDir = path.join(vaultPath, '记录');
    if (!fs.existsSync(recordDir)) {
      fs.mkdirSync(recordDir, { recursive: true });
    }

    const createdStr = new Date(booking.created_at).toLocaleString('zh-CN', {
      timeZone: 'Asia/Manila',
    });

    const content = `---
tags: [consultation, landing-page]
created: ${createdStr}
status: consultation
---

# 咨询 - ${booking.name}

- **联系方式**: ${booking.contact || '未提供'}
- **来源页面**: ${booking.source_slug || 'N/A'}

## 咨询内容

${booking.content}

---
*自动记录于 ${createdStr}*
`;

    const fileName = `咨询-${booking.id}.md`;
    const filePath = path.join(recordDir, fileName);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}
