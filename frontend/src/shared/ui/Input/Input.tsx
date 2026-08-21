import type { InputHTMLAttributes } from "react";

import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input {...props} className={styles.input} />
    </label>
  );
};
