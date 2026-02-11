import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LandingPagesService } from './landing-pages/landing-pages.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(LandingPagesService);

  try {
    const existing = await service.findBySlug('manila');
    console.log('Manila page already exists');
  } catch (e) {
    console.log('Creating Manila page...');
    await service.create({
      slug: 'manila',
      title: 'AI助理安装服务',
      content: JSON.stringify({
        headline: 'Turn your PC into a real-life JARVIS.',
        subheadline: 'Stop using basic ChatGPT. Transform your idle computer into a high-end private AI assistant.',
        cta: 'Book Setup Now',
        price: '5,000 PHP'
      }),
      is_active: true,
    } as any);
    console.log('Created!');
  }

  await app.close();
}
bootstrap();
