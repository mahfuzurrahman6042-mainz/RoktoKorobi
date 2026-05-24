"use client";

import { useTestimonial } from '@/hooks/useTestimonial';
import { TestimonialButton } from '@/components/TestimonialButton';
import Link from 'next/link';

export default function Testimonial() {
  const {
    mounted,
    language,
    formData,
    submitting,
    submitted,
    errors,
    t,
    handleInputChange,
    handleSubmit,
    ratingOptions
  } = useTestimonial();

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 16px !important;
          }
          nav span:first-child {
            font-size: 24px !important;
          }
          nav .font-serif {
            font-size: 18px !important;
          }
          form {
            padding: 24px !important;
          }
          .grid-cols-1.md\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-amber-50/95 backdrop-blur-md px-16 py-3.5 flex items-center justify-between border-b border-red-900/12 shadow-[0_2px_40px_rgba(26,15,10,0.08)]">
        <Link href="/" className="flex items-center gap-3 text-decoration-none">
          <span className="text-9xl leading-none">🩸</span>
          <div>
            <span className="font-serif text-2xl text-red-800 tracking-tightest">রক্তকরবী</span>
            <span className="text-xs text-teal-700 font-medium tracking-[0.15em] uppercase block mt-0.5">RoktoKorobi</span>
          </div>
        </Link>
        <Link href="/" className="bg-red-800 text-white px-6.5 py-2.5 rounded-full font-semibold text-xs no-underline shadow-[0_4px_20px_rgba(192,21,42,0.3)]">
          {t('back')}
        </Link>
      </nav>

      {/* Main Content */}
      <div className="pt-25 min-h-screen bg-amber-50">
        <div className="max-w-2xl mx-auto px-5 py-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-stone-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-stone-700 leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl text-green-800 mb-4">
                {t('success')}
              </h2>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-stone-50 rounded-3xl p-12 shadow-[0_4px_60px_rgba(26,15,10,0.06)] border border-red-800/8">
              <div className="grid gap-6">
                
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      aria-label={t('name')}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className="w-full px-4.5 py-3.5 border-[1.5px] border-stone-200/10 rounded-xl text-base bg-amber-50 outline-none transition-all duration-300 focus:border-red-800 focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
                    />
                    {errors.name && (
                      <p id="name-error" className="text-sm text-red-600 mt-1" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      aria-label={t('email')}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className="w-full px-4.5 py-3.5 border-[1.5px] border-stone-200/10 rounded-xl text-base bg-amber-50 outline-none transition-all duration-300 focus:border-red-800 focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone and Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      aria-label={t('phone')}
                      className="w-full px-4.5 py-3.5 border-[1.5px] border-stone-200/10 rounded-xl text-base bg-amber-50 outline-none transition-all duration-300 focus:border-red-800 focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      {t('rating')}
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      aria-label={t('rating')}
                      className="w-full px-4.5 py-3.5 border-[1.5px] border-stone-200/10 rounded-xl text-base bg-amber-50 outline-none transition-all duration-300 focus:border-red-800 focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
                    >
                      {ratingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.stars} {option.label[language]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Testimonial */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    {t('testimonial')} *
                  </label>
                  <textarea
                    name="testimonial"
                    value={formData.testimonial}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder={t('placeholder')}
                    aria-label={t('testimonial')}
                    aria-describedby={errors.testimonial ? 'testimonial-error' : undefined}
                    className="w-full px-4.5 py-3.5 border-[1.5px] border-stone-200/10 rounded-xl text-base bg-amber-50 outline-none transition-all duration-300 focus:border-red-800 focus:ring-2 focus:ring-red-800 focus:ring-offset-2 resize-y"
                  />
                  {errors.testimonial && (
                    <p id="testimonial-error" className="text-sm text-red-600 mt-1" role="alert">
                      {errors.testimonial}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label={t('submit')}
                  className="w-full py-4 bg-red-800 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(192,21,42,0.3)] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 motion-safe:hover:scale-[1.02]"
                >
                  {submitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
