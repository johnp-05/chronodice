import React from 'react';
import { View } from 'react-native';

/**
 * Átomo: DiceDot
 * 
 * Representa un punto individual en la cara del dado.
 * Elemento visual más básico del dado.
 */

interface DiceDotProps {
  /**
   * Tamaño del punto en píxeles
   */
  size?: number;
  
  /**
   * Color del punto
   */
  color?: string;
}

export function DiceDot({ 
  size = 20, 
  color = '#1f2937' 
}: DiceDotProps) {
  return (
    <View
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  );
}