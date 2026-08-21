import { memo } from "react";

import { StatChip } from "@/shared/ui/StatChip/StatChip";

import type { TransferBoardHeaderProps } from "./types";
import styles from "./TransferBoardWidget.module.css";

export const TransferBoardHeader = memo(
  ({ availableCount, selectedCount }: TransferBoardHeaderProps) => {
    return (
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Fullstack Assignment</p>
          <h1 className={styles.title}>Панель выбора и сортировки элементов</h1>
        </div>

        <div className={styles.heroStats}>
          <StatChip label="Доступно" value={String(availableCount)} />
          <StatChip label="Выбрано" value={String(selectedCount)} />
        </div>
      </header>
    );
  },
);
