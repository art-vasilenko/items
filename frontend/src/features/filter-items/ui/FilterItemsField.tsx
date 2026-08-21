import { Input } from "@/shared/ui/Input/Input";

type FilterItemsFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export const FilterItemsField = ({ placeholder, value, onChange }: FilterItemsFieldProps) => {
  return (
    <Input
      label="Фильтр по ID"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
