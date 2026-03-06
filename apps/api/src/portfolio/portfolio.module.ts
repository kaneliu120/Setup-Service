import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioItem } from './entities/portfolio-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioItem])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
