import type { PropsWithChildren } from "react";

import styles from "./MainLayout.module.css";

export const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.layout}>
      <div className={styles.backdrop} />
      <main className={styles.content}>{children}</main>
    </div>
  );
};
