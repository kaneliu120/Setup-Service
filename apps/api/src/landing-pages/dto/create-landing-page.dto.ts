import { LandingPageContent } from '../entities/landing-page.entity';

export class CreateLandingPageDto {
  slug: string;
  title: string;
  is_active?: boolean;
  content: LandingPageContent;
}
