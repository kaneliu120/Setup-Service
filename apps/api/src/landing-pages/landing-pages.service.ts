import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPage } from './entities/landing-page.entity';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';

@Injectable()
export class LandingPagesService {
  constructor(
    @InjectRepository(LandingPage)
    private landingPageRepository: Repository<LandingPage>,
  ) {}

  async findAll() {
    return this.landingPageRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findActive() {
    return this.landingPageRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const page = await this.landingPageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.landingPageRepository.findOne({
      where: { slug, is_active: true },
    });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  async create(dto: CreateLandingPageDto) {
    const page = this.landingPageRepository.create(dto);
    return this.landingPageRepository.save(page);
  }

  async update(id: number, dto: UpdateLandingPageDto) {
    await this.landingPageRepository.update(id, dto);
    return this.findOne(id);
  }

  async toggleActive(id: number) {
    const page = await this.findOne(id);
    page.is_active = !page.is_active;
    return this.landingPageRepository.save(page);
  }

  async remove(id: number) {
    return this.landingPageRepository.delete(id);
  }
}
