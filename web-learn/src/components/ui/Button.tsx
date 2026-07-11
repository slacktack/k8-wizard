import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export default function Button({ variant = 'default', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'font-mono uppercase tracking-wider border no-underline inline-flex items-center gap-2 transition-all duration-150';
  const sizes = {
    sm: 'text-[0.72rem] px-[9px] py-[6px]',
    md: 'text-[0.8rem] px-[20px] py-[10px] font-[500]',
  };
  const variants = {
    default: 'border-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-[var(--bg)]',
    primary: 'border-[var(--blueprint)] bg-[var(--blueprint)] text-[var(--bg)] hover:bg-[var(--blueprint-hover)] hover:border-[var(--blueprint-hover)]',
    secondary: 'border-[var(--ink)] bg-transparent hover:bg-[var(--ink)] hover:text-[var(--bg)]',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
