import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LandingPagesService } from './landing-pages/landing-pages.service';
import { AuthService } from './auth/auth.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const landingService = app.get(LandingPagesService);
  const authService = app.get(AuthService);

  try {
    // 1. 初始化管理员账号
    console.log('Checking for admin user...');
    // 由于是新库，直接尝试创建或通过 service 逻辑处理
    // 这里我们直接通过代码逻辑模拟，如果需要更复杂的可以读 User Entity
    const adminEmail = 'admin@myskillstore.fun';
    const adminPassword = 'admin_password_2026'; // 请凯哥登录后第一时间修改
    
    // 注意：具体实现在 authService.register 或直接通过 repo
    // 为了简单，我们这里假设数据库是空的，直接运行 seed 逻辑
    
    // 2. 初始化或更新默认落地页
    const newFaqItems = [
      {
        title: ['What is a private AI assistant?', '什么是私人AI助理？'],
        content: ['A private AI assistant runs locally on your computer, ensuring complete privacy and data security. Unlike cloud-based AI, your data never leaves your device.', '私人AI助理在您的电脑本地运行，确保完全的隐私和数据安全。与基于云的AI不同，您的数据永远不会离开您的设备。'],
        image: '/images/faq/privacy.jpg'
      },
      {
        title: ['Do I need a powerful computer?', '我需要一台强大的电脑吗？'],
        content: ['You need a computer with a decent GPU (NVIDIA RTX 3060 or better recommended) for optimal performance. Mac M1/M2/M3 chips also work great.', '您需要一台配备不错的GPU（推荐NVIDIA RTX 3060或更高）的电脑以获得最佳性能。Mac M1/M2/M3芯片也能很好地工作。'],
        image: '/images/faq/hardware.jpg'
      },
      {
        title: ['Can I access it from my phone?', '我可以通过手机访问吗？'],
        content: ['Yes! Once set up, you can access your private AI assistant from any device on your local network, including your phone and tablet.', '是的！设置完成后，您可以通过局域网内的任何设备（包括手机和平板）访问您的私人AI助理。'],
        image: '/images/faq/mobile-access.jpg'
      },
      {
        title: ['Is it difficult to use?', '使用起来困难吗？'],
        content: ['Not at all. The interface is similar to ChatGPT, very intuitive and easy to use. We also provide a user guide.', '一点也不。界面类似于ChatGPT，非常直观且易于使用。我们也提供用户指南。'],
        image: '/images/faq/interface.jpg'
      },
      {
        title: ['What if I need help later?', '如果我以后需要帮助怎么办？'],
        content: ['We offer post-setup support to ensure everything runs smoothly. You can contact us anytime for assistance.', '我们提供设置后的支持，确保一切运行顺畅。您可以随时联系我们寻求帮助。'],
        image: '/images/faq/support.jpg'
      },
      {
        title: ['Can it read my documents?', '它可以阅读我的文档吗？'],
        content: ['Yes, one of the key features is the ability to ingest your local documents (PDFs, Word, etc.) and answer questions based on them.', '是的，主要功能之一就是能够读取您的本地文档（PDF、Word等）并根据它们回答问题。'],
        image: '/images/faq/documents.jpg'
      },
      {
        title: ['Is there a monthly fee?', '有月费吗？'],
        content: ['No, this is a one-time setup fee. Once installed, the software is yours to use forever without subscription costs.', '没有，这是一次性设置费。安装后，软件归您永久使用，无需订阅费。'],
        image: '/images/faq/pricing.jpg'
      }
    ];

    const updateFaq = async (slug: string) => {
      try {
        const page = await landingService.findBySlug(slug);
        console.log(`${slug} page exists, updating FAQ content...`);
        let content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;
        (content as any).faq_items = newFaqItems;
        (content as any).faq_title = ['Frequently Asked Questions', '常见问题解答'];
        await landingService.update(page.id, { content: content });
        console.log(`${slug} page FAQ updated!`);
      } catch (e) {
        if (slug === 'manila') { // Only create manila if not found
          console.log(`Creating ${slug} page...`);
          await landingService.create({
            slug: 'manila',
            title: 'Manila Landing Page',
            content: {
              header_title: 'Private AI Assistant',
              hero_headline: 'Turn your PC into a real-life JARVIS.',
              hero_description: 'Stop using basic ChatGPT. Transform your idle computer into a high-end private AI assistant.',
              hero_cta_text: 'Book Setup Now',
              pricing_title: 'One-time Setup',
              pricing_amount: '5,000 PHP',
              pricing_details: ['Remote Setup', 'Software Installation', 'User Guide'],
              cta_title: 'Ready to upgrade?',
              cta_description: 'Book your setup now.',
              contact_methods: [],
              footer_text: '© 2026 Private AI. All rights reserved.',
              about_title: 'About Us',
              about_text: 'We help you set up private AI.',
              services_title: 'Our Services',
              services: [],
              faq_title: ['Frequently Asked Questions', '常见问题解答'],
              faq_items: newFaqItems
            } as any,
            is_active: true,
          });
          console.log(`${slug} page created!`);
        }
      }
    };

    await updateFaq('manila');
    await updateFaq('manila-v2');

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await app.close();
  }
}
bootstrap();

