import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";

import styles from "./AddManualItemForm.module.css";

type AddManualItemFormProps = {
  value: string;
  error: string | null;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export const AddManualItemForm = ({
  value,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: AddManualItemFormProps) => {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <Input
        label="Новый ID"
        placeholder="Например, 1000001"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Добавляем..." : "Добавить элемент"}
      </Button>
    </form>
  );
};
