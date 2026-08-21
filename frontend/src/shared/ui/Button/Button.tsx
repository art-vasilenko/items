import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import styles from "./Button.module.css";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={className ? `${styles.button} ${className}` : styles.button}
    >
      {children}
    </button>
  );
};
