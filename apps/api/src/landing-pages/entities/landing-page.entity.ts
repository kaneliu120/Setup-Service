import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('landing_pages')
export class LandingPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ default: false })
  is_active: boolean;

  @Column('jsonb')
  content: LandingPageContent;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export interface LandingPageContent {
  header_title: string;
  header_subtitle?: string;
  languages?: string[];
  location_label?: string;

  hero_headline: string;
  hero_description: string;
  hero_cta_text: string;

  about_title: string;
  about_text: string;

  services_title: string;
  services: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  pricing_title: string;
  pricing_amount: string;
  pricing_details: string[];

  cta_title: string;
  cta_description: string;
  contact_methods: Array<{
    type: string;
    label: string;
    value: string;
  }>;

  footer_text: string;

  primary_color?: string;
  accent_color?: string;
}
