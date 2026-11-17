'use client';

import { useEffect } from 'react';

const EXPERIENCE_STATS = [350, 105, 117];

/** Keeps the homepage testimonial stats in sync with the black hero card. */
export default function ExperienceStatsSync() {
  useEffect(() => {
    const syncStats = () => {
      const language = document.documentElement.lang.toLowerCase();
      const numberFormatter = new Intl.NumberFormat(language.startsWith('bn') ? 'bn-BD' : 'en-US');
      const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));

      for (const section of sections) {
        const sectionText = section.textContent || '';
        if (!sectionText.includes('TESTIMONIALS') && !sectionText.includes('সাক্ষ্য')) continue;

        const statRow = Array.from(section.querySelectorAll<HTMLElement>('.rk-reveal'))
          .map(element => element.firstElementChild as HTMLElement | null)
          .find(row => {
            if (!row || row.children.length !== EXPERIENCE_STATS.length) return false;
            const labels = Array.from(row.children).map(item => item.textContent || '').join(' ').toLowerCase();
            return (labels.includes('donor') || labels.includes('দাতা')) &&
              (labels.includes('request') || labels.includes('অনুরোধ')) &&
              (labels.includes('organisation') || labels.includes('organization') || labels.includes('সংস্থা') || labels.includes('প্রতিষ্ঠান'));
          });

        if (!statRow) continue;
        Array.from(statRow.children).forEach((item, index) => {
          const number = item.firstElementChild as HTMLElement | null;
          if (number) number.textContent = numberFormatter.format(EXPERIENCE_STATS[index]);
        });
      }
    };

    syncStats();
    const observer = new MutationObserver(syncStats);
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
