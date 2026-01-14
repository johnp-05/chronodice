import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { DiceValue } from '../../../domain/models/Dice';
import { DiceService } from '../../../domain/services/DiceService';
import { DiceDot } from '../atoms/DiceDot';

/**
 * Molécula: DiceFace
 * 
 * Combina múltiples DiceDots para formar una cara completa del dado.
 * Representa la unidad funcional mínima del dado visual.
 * 
 * Composición:
 * - Grid 3x3 (View contenedor)
 * - 1-6 DiceDots según el valor
 */

interface DiceFaceProps {
  /**
   * Valor de la cara del dado (1-6)
   */
  value: DiceValue;
  
  /**
   * Tamaño del dado en píxeles
   */
  size?: number;
  
  /**
   * Si el dado está en animación de lanzamiento
   */
  isRolling?: boolean;
  
  /**
   * Valor de rotación animada (opcional)
   */
  rotationValue?: Animated.Value;
}

export function DiceFace({ 
  value, 
  size = 150,
  isRolling = false,
  rotationValue 
}: DiceFaceProps) {
  // Obtiene las posiciones de los puntos para este valor
  const dotPositions = DiceService.getDotPositions(value);
  
  // Tamaño de cada punto (20% del tamaño total del dado)
  const dotSize = size * 0.13;
  
  // Tamaño de cada celda en el grid 3x3
  const cellSize = size / 3;

  // Animación de rotación si está disponible
  const animatedStyle = rotationValue ? {
    transform: [
      {
        rotate: rotationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  } : {};

  return (
    <Animated.View 
      className="bg-white rounded-3xl"
      style={[
        {
          width: size,
          height: size,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        },
        animatedStyle,
      ]}
    >
      {/* Grid 3x3 para posicionar los puntos */}
      <View className="flex-1 p-4">
        {[0, 1, 2].map((row) => (
          <View 
            key={row} 
            className="flex-1 flex-row"
          >
            {[0, 1, 2].map((col) => {
              // Verifica si esta posición debe tener un punto
              const hasDot = dotPositions.some(
                ([r, c]) => r === row && c === col
              );

              return (
                <View
                  key={`${row}-${col}`}
                  className="flex-1 justify-center items-center"
                  style={{ width: cellSize, height: cellSize }}
                >
                  {hasDot && <DiceDot size={dotSize} />}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Indicador visual de que está rodando */}
      {isRolling && (
        <View 
          className="absolute inset-0 bg-primary-500/10 rounded-3xl"
          style={{
            borderWidth: 3,
            borderColor: '#0ea5e9',
          }}
        />
      )}
    </Animated.View>
  );
}