import clsx from 'clsx';
import styles from './Button.module.scss';
import type { ButtonProps } from './types';

// The label is text or rich content (e.g. several spans). Children are rendered after it, so they are
// meant for an icon.
const Button = ({
  label,
  variant = 'primary',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={clsx(styles.button, styles[`button--${variant}`], className)}
    {...props}
  >
    {label}
    {children}
  </button>
);

export default Button;
