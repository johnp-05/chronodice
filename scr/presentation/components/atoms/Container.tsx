import React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Átomo: Container
 * 
 * Componente básico de contenedor con estilos consistentes.
 * Este es el elemento más simple de nuestro sistema de diseño.
 * 
 * Responsabilidad: Proporcionar un contenedor reutilizable con
 * variantes de estilo predefinidas.
 */

interface ContainerProps extends ViewProps {
  /**
   * Variante del contenedor que aplica estilos predefinidos
   */
  variant?: 'default' | 'card' | 'centered';
  
  /**
   * Clase adicional de NativeWind para personalización
   */
  className?: string;
}

export function Container({ 
  variant = 'default', 
  className = '',
  children,
  ...props 
}: ContainerProps) {
  const baseClasses = 'flex-1';
  
  const variantClasses = {
    default: '',
    card: 'bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg',
    centered: 'justify-center items-center',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}