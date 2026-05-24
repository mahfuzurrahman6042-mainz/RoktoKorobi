export interface TestimonialFormData {
  name: string;
  email: string;
  phone: string;
  testimonial: string;
  rating: '1' | '2' | '3' | '4' | '5';
}

export interface TestimonialSubmission {
  id: string;
  formData: TestimonialFormData;
  submittedAt: Date;
  language: 'en' | 'bn';
}

export interface TestimonialTranslations {
  title: { en: string; bn: string };
  subtitle: { en: string; bn: string };
  name: { en: string; bn: string };
  email: { en: string; bn: string };
  phone: { en: string; bn: string };
  testimonial: { en: string; bn: string };
  rating: { en: string; bn: string };
  submit: { en: string; bn: string };
  back: { en: string; bn: string };
  success: { en: string; bn: string };
  submitting: { en: string; bn: string };
  placeholder: { en: string; bn: string };
  shareStory: { en: string; bn: string };
  testimonialsComing: { en: string; bn: string };
  beFirst: { en: string; bn: string };
}

export type Language = 'en' | 'bn';

export type RatingOption = {
  value: TestimonialFormData['rating'];
  label: { en: string; bn: string };
  stars: string;
};
