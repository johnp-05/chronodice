import React from 'react';
import { View } from 'react-native';
import { DiceValue } from '../../../domain/models/Dice';
import { DiceService } from '../../../domain/services/DiceService';
import { DiceDot } from '../atoms/DiceDot';

/**
 * Molécula: DiceFace (Versión Mejorada)
 * 
 * Mejoras:
 * - Sombras más pronunciadas
 * - Bordes más definidos
 * - Colores más vibrantes
 * - Mejor contraste
 */

interface DiceFaceProps {
  value: DiceValue;
  size?: number;
  isRolling?: boolean;
}

export function DiceFace({ 
  value, 
  size = 150,
  isRolling = false,
}: DiceFaceProps) {
  const dotPositions = DiceService.getDotPositions(value);
  const dotSize = size * 0.15;
  const cellSize = size / 3;

  return (
    <View 
      style={{
        width: size,
        height: size,
        backgroundColor: '#ffffff',
        borderRadius: size * 0.15,
        borderWidth: 2,
        borderColor: isRolling ? '#0ea5e9' : '#e5e7eb',
        // Sombra iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        // Sombra Android
        elevation: 12,
        padding: size * 0.1,
      }}
    >
      {/* Grid 3x3 para posicionar los puntos */}
      <View style={{ flex: 1 }}>
        {[0, 1, 2].map((row) => (
          <View 
            key={row} 
            style={{
              flex: 1,
              flexDirection: 'row',
            }}
          >
            {[0, 1, 2].map((col) => {
              const hasDot = dotPositions.some(
                ([r, c]) => r === row && c === col
              );

              return (
                <View
                  key={`${row}-${col}`}
                  style={{
                    flex: 1,
                    width: cellSize,
                    height: cellSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {hasDot && (
                    <DiceDot 
                      size={dotSize} 
                      color={isRolling ? '#0ea5e9' : '#1f2937'}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Efecto de brillo cuando está rodando */}
      {isRolling && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            borderRadius: size * 0.15,
            borderWidth: 3,
            borderColor: '#0ea5e9',
          }}
        />
      )}
    </View>
  );
}