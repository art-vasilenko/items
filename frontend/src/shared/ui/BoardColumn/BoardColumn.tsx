import type { PropsWithChildren, ReactNode } from "react";

import styles from "./BoardColumn.module.css";

type BoardColumnProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  note: string;
  actions?: ReactNode;
}>;

export const BoardColumn = ({
  title,
  subtitle,
  note,
  actions,
  children,
}: BoardColumnProps) => {
  return (
    <div className={styles.column}>
      <header className={styles.header}>
        <div>
          <p className={styles.subtitle}>{subtitle}</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.note}>{note}</p>
        </div>
      </header>

      {actions ? <div className={styles.actions}>{actions}</div> : null}

      <div className={styles.content}>{children}</div>
    </div>
  );
};
