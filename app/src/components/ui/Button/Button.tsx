import clsx from 'clsx';
import styles from './Button.module.scss';
import type { ButtonProps } from './types';

// Children are rendered after the label, so they are meant for an icon.
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
