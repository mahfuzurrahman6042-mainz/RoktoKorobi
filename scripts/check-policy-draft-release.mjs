import { readFileSync } from 'node:fs';

const drafts = ['india-privacy-draft.md', 'india-terms-draft.md', 'pakistan-privacy-draft.md', 'pakistan-terms-draft.md'];
const source = drafts.map((name) => readFileSync(new URL(`../docs/${name}`, import.meta.url), 'utf8')).join('\n');
const blockers = ['— DRAFT', 'Effective date: Not assigned', '[NOT SET', '[PUBLICATION BLOCKER', '[OWNER CONFIRMATION REQUIRED', '[NEEDS ENGINEERING VERIFICATION', '[LOCAL LEGAL REVIEW REQUIRED', '[MEDICAL REVIEW REQUIRED', '[INSERT'];
const remaining = blockers.filter((item) => source.includes(item));
if (remaining.length) {
  console.error('Policy publication blocked. Review copies or unresolved markers remain:');
  for (const marker of remaining) console.error(`  ${marker}`);
  process.exitCode = 1;
} else {
  console.log('No review-copy markers remain. This is not legal or medical approval; run the country release gate too.');
}
