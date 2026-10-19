import { COUNTRIES, type CountryCode, enrollmentOpen } from '@/lib/countries';

export default function CountryField({ value, onChange, className = '' }: {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  className?: string;
}) {
  return <label className="block text-sm font-semibold">
    Country
    <select required value={value} onChange={event => onChange(event.target.value as CountryCode)} className={className}>
      {COUNTRIES.map(country => <option value={country.code} key={country.code}>
        {country.name}{enrollmentOpen(country.code) ? '' : ' — launch pending'}
      </option>)}
    </select>
    {!enrollmentOpen(value) && <span className="mt-1 block text-xs font-normal text-[#6B5A50]" role="status">Enrollment is not yet open here. We are confirming local medical partners and privacy terms.</span>}
  </label>;
}
