// src/components/ui/button.js
import React from 'react';

export const Button = ({ children, className, variant, asChild, ...props }) => {
  const baseClass = 'px-4 py-2 rounded-md font-semibold text-white';
  const variantClass = variant === 'secondary' ? 'bg-blue-500' : 'bg-primary';

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
