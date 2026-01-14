import React from 'react';
import { View, Text } from 'react-native';
import { DiceValue } from '../../../domain/models/Dice';
import { DiceService } from '../../../domain/services/DiceService';

/**
 * Molécula: DiceFace (D20)
 * 
 * Representa un dado de 20 caras (icosaedro).
 * Muestra el número en grande con colores según el valor.
 * 
 * Diseño:
 * - Forma de diamante/icosaedro estilizado
 * - Número grande centrado
 * - Colores que indican la calidad del resultado
 */

interface DiceFaceProps {
  value: DiceValue;
  size?: number;
  isRolling?: boolean;
}

export function DiceFace({ 
  value, 
  size = 200,
  isRolling = false,
}: DiceFaceProps) {
  const backgroundColor = DiceService.getDiceColor(value);
  const textColor = DiceService.getTextColor(value);
  const fontSize = size * 0.35; // 35% del tamaño del dado

  return (
    <View 
      style={{
        width: size,
        height: size,
        backgroundColor: isRolling ? '#0ea5e9' : backgroundColor,
        // Forma de diamante (icosaedro estilizado)
        transform: [{ rotate: '45deg' }],
        borderRadius: size * 0.15,
        borderWidth: 3,
        borderColor: isRolling ? '#0284c7' : 'rgba(0,0,0,0.2)',
        // Sombras
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
        // Centrado
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Contenedor interno (rotado de vuelta para que el texto esté derecho) */}
      <View
        style={{
          transform: [{ rotate: '-45deg' }],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Número principal */}
        <Text
          style={{
            fontSize: fontSize,
            fontWeight: '900',
            color: isRolling ? '#ffffff' : textColor,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {value}
        </Text>

        {/* Indicador de crítico */}
        {value === 20 && !isRolling && (
          <Text
            style={{
              fontSize: size * 0.08,
              fontWeight: '700',
              color: '#92400e',
              marginTop: -5,
            }}
          >
            ¡CRÍTICO!
          </Text>
        )}

        {/* Indicador de fallo */}
        {value === 1 && !isRolling && (
          <Text
            style={{
              fontSize: size * 0.08,
              fontWeight: '700',
              color: '#ffffff',
              marginTop: -5,
            }}
          >
            FALLO
          </Text>
        )}
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: size * 0.15,
          }}
        />
      )}

      {/* Líneas decorativas (simulan facetas del icosaedro) */}
      {!isRolling && (
        <>
          <View
            style={{
              position: 'absolute',
              top: '20%',
              width: '60%',
              height: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: '20%',
              width: '60%',
              height: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '20%',
              height: '60%',
              width: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: '20%',
              height: '60%',
              width: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          />
        </>
      )}
    </View>
  );
}