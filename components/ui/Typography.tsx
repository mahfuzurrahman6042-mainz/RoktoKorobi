import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const H1 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={`text-4xl font-bold text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={`text-3xl font-semibold text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-2xl font-semibold text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={`text-xl font-medium text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </h4>
    );
  }
);

H4.displayName = 'H4';

export const Body = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-base text-gray-700 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Body.displayName = 'Body';

export const Small = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-gray-600 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Small.displayName = 'Small';

export const Label = React.forwardRef<HTMLLabelElement, TypographyProps & { htmlFor?: string }>(
  ({ children, className = '', htmlFor, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`block text-sm font-medium text-gray-700 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
