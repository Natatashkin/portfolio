import type { ComponentPropsWithoutRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'transparent';

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  label: string;
  variant?: ButtonVariant;
};
