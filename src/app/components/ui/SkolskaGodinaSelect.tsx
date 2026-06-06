import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { generisiSkolskeGodine } from '@/lib/skolskaGodina';

interface Props {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  includeSveOpcija?: boolean;
  sveLabel?: string;
}

export function SkolskaGodinaSelect({
  value,
  onChange,
  id,
  className,
  placeholder = 'Izaberi godinu',
  disabled,
  includeSveOpcija,
  sveLabel = 'Sve godine',
}: Props) {
  const godine = useMemo(() => generisiSkolskeGodine(), []);
  const sveVrednost = '__SVE__';
  const selectValue = includeSveOpcija && !value ? sveVrednost : value;
  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onChange(v === sveVrednost ? '' : v)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeSveOpcija && <SelectItem value={sveVrednost}>{sveLabel}</SelectItem>}
        {godine.map((g) => (
          <SelectItem key={g} value={g}>
            {g}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
