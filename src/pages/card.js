// src/components/ui/card.js
import React from 'react';

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => (
  <div className="border-b pb-4">{children}</div>
);

export const CardTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

export const CardDescription = ({ children }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

export const CardContent = ({ children }) => (
  <div className="py-4">{children}</div>
);

export const CardFooter = ({ children }) => (
  <div className="pt-4">{children}</div>
);
