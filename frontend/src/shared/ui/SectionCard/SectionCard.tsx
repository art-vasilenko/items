import type { PropsWithChildren } from "react";

import styles from "./SectionCard.module.css";

type SectionCardProps = PropsWithChildren<{
  emphasized?: boolean;
}>;

export const SectionCard = ({ children, emphasized = false }: SectionCardProps) => {
  return (
    <div className={emphasized ? `${styles.card} ${styles.emphasized}` : styles.card}>
      {children}
    </div>
  );
};
