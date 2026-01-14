import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

/**
 * Átomo: Text
 * 
 * Componente de texto con variantes tipográficas predefinidas.
 * Mantiene consistencia visual en toda la aplicación.
 */

interface TextProps extends RNTextProps {
  /**
   * Variante tipográfica
   */
  variant?: 'h1' | 'h2' | 'body' | 'caption' | 'mono';
  
  /**
   * Peso de la fuente
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Clase adicional de NativeWind
   */
  className?: string;
}

export function Text({ 
  variant = 'body',
  weight = 'normal',
  className = '',
  children,
  ...props 
}: TextProps) {
  const variantClasses = {
    h1: 'text-4xl',
    h2: 'text-2xl',
    body: 'text-base',
    caption: 'text-sm',
    mono: 'text-base font-mono',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const baseClasses = 'text-gray-900 dark:text-gray-100';
  const classes = `${baseClasses} ${variantClasses[variant]} ${weightClasses[weight]} ${className}`;

  return (
    <RNText className={classes} {...props}>
      {children}
    </RNText>
  );
}