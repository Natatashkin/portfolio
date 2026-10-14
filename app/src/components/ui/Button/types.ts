import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'transparent';

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  label: ReactNode;
  variant?: ButtonVariant;
};
