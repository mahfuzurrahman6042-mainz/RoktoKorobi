import { COUNTRIES, type CountryCode, enrollmentOpen, partnerEnrollmentOpen } from '@/lib/countries';

export default function CountryField({ value, onChange, className = '', purpose = 'account' }: {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  className?: string;
  purpose?: 'account' | 'partner';
}) {
  const isOpen = purpose === 'partner' ? partnerEnrollmentOpen : enrollmentOpen;
  return <label className="block text-sm font-semibold">
    Country
    <select required value={value} onChange={event => onChange(event.target.value as CountryCode)} className={className}>
      {COUNTRIES.map(country => <option value={country.code} key={country.code}>
        {country.name}{isOpen(country.code) ? '' : ' — launch pending'}
      </option>)}
    </select>
    {!isOpen(value) && <span className="mt-1 block text-xs font-normal text-[#6B5A50]" role="status">Enrollment is not yet open here. Country-specific policies, safety procedures and release checks are under review.</span>}
  </label>;
}
