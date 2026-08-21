import styles from "./StatChip.module.css";

type StatChipProps = {
  label: string;
  value: string;
};

export const StatChip = ({ label, value }: StatChipProps) => {
  return (
    <div className={styles.chip}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
    </div>
  );
};
