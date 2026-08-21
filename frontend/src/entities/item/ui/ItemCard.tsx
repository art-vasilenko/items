import { memo } from "react";

import styles from "./ItemCard.module.css";

type ItemTone = "neutral" | "accent" | "selected" | "manual";

type ItemCardProps = {
  id: number;
  tone?: ItemTone;
  prefix?: string;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction?: () => void;
};

export const ItemCard = memo(({
  id,
  tone = "neutral",
  prefix,
  actionLabel,
  actionDisabled = false,
  onAction,
}: ItemCardProps) => {
  return (
    <article className={`${styles.card} ${styles[`tone_${tone}`]}`}>
      <div className={styles.body}>
        <div className={styles.meta}>
          {prefix ? <span className={styles.prefix}>{prefix}</span> : null}
          <span className={styles.label}>ID элемента</span>
        </div>
        <strong className={styles.id}>{id}</strong>
      </div>

      <button
        className={styles.action}
        type="button"
        onClick={onAction}
        disabled={actionDisabled}
      >
        {actionLabel}
      </button>
    </article>
  );
});
