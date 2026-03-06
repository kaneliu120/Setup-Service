import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private blogRepository: Repository<BlogPost>,
  ) {}

  async findAll() {
    return this.blogRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findAllPublished() {
    return this.blogRepository.find({
      where: { is_published: true },
      order: { published_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.blogRepository.findOne({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.blogRepository.findOne({
      where: { slug, is_published: true },
    });
  }

  async create(dto: CreateBlogPostDto) {
    const post = this.blogRepository.create({
      ...dto,
      published_at: dto.is_published ? new Date() : null,
    });
    return this.blogRepository.save(post);
  }

  async update(id: number, dto: UpdateBlogPostDto) {
    const existing = await this.findOne(id);
    if (!existing) return null;

    // Auto-set published_at when publishing for the first time
    if (dto.is_published && !existing.is_published && !existing.published_at) {
      dto['published_at'] = new Date() as any;
    }

    await this.blogRepository.update(id, dto);
    return this.findOne(id);
  }

  async togglePublished(id: number) {
    const post = await this.findOne(id);
    if (!post) return null;
    const is_published = !post.is_published;
    const published_at = is_published && !post.published_at ? new Date() : post.published_at;
    await this.blogRepository.update(id, { is_published, published_at });
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.blogRepository.delete(id);
  }
}
