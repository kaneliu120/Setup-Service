import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioItem } from './entities/portfolio-item.entity';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioItem)
    private portfolioRepository: Repository<PortfolioItem>,
  ) {}

  async findAll() {
    return this.portfolioRepository.find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findAllActive() {
    return this.portfolioRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.portfolioRepository.findOne({ where: { id } });
  }

  async create(dto: CreatePortfolioItemDto) {
    const item = this.portfolioRepository.create(dto);
    return this.portfolioRepository.save(item);
  }

  async update(id: number, dto: UpdatePortfolioItemDto) {
    await this.portfolioRepository.update(id, dto);
    return this.findOne(id);
  }

  async toggleActive(id: number) {
    const item = await this.findOne(id);
    if (!item) return null;
    await this.portfolioRepository.update(id, { is_active: !item.is_active });
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.portfolioRepository.delete(id);
  }
}
