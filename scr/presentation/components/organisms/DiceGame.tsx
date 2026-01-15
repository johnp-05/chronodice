import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Vibration, TouchableOpacity, Switch } from 'react-native';
import { Dices, Smartphone, Trophy, Skull, Box } from 'lucide-react-native';
import { Container } from '../atoms/Container';
import { Text } from '../atoms/Text';
import { DiceFace } from '../molecules/DiceFace';
import { Dice3DRenderer } from '../molecules/Dice3DRenderer';
import { SensorStatus } from '../molecules/SensorStatus';
import { DiceValue, DiceState, DICE_CONSTANTS } from '../../../domain/models/Dice';
import { DiceService } from '../../../domain/services/DiceService';
import { useShakeDetection } from '../../../infrastructure/hooks/useShakeDetection';

/**
 * Organismo: DiceGame
 * 
 * Versión mejorada con opción de dado 2D o 3D
 */

export function DiceGame() {
  const [diceState, setDiceState] = useState<DiceState>(
    DiceService.createInitialState()
  );

  const [displayValue, setDisplayValue] = useState<DiceValue>(1);
  const [use3D, setUse3D] = useState(true); // Toggle 2D/3D

  // Animaciones (solo para 2D)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const { accelerometerData, magnitude, isAvailable } = useShakeDetection(
    {
      threshold: DICE_CONSTANTS.DEFAULT_SHAKE_THRESHOLD,
      cooldownMs: DICE_CONSTANTS.DEFAULT_COOLDOWN,
    },
    handleShake
  );

  /**
   * Valores aleatorios durante animación (solo para 2D)
   */
  useEffect(() => {
    if (diceState.isRolling && !use3D) {
      const interval = setInterval(() => {
        setDisplayValue(DiceService.rollDice());
      }, 60);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(diceState.currentValue);
    }
  }, [diceState.isRolling, diceState.currentValue, use3D]);

  function handleShake() {
    if (diceState.isRolling) return;
    rollDice();
  }

  function handleTap() {
    if (diceState.isRolling) return;
    rollDice();
  }

  /**
   * Lanza el dado con animación
   */
  function rollDice() {
    Vibration.vibrate(100);

    setDiceState(DiceService.createRolledState(diceState));

    // Animaciones solo para 2D
    if (!use3D) {
      rotationAnim.setValue(0);
      scaleAnim.setValue(1);

      Animated.parallel([
        Animated.timing(rotationAnim, {
          toValue: 3,
          duration: DICE_CONSTANTS.ROLL_ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: DICE_CONSTANTS.ROLL_ANIMATION_DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        finishRoll();
      });
    } else {
      // Para 3D, solo esperamos la duración
      setTimeout(() => {
        finishRoll();
      }, DICE_CONSTANTS.ROLL_ANIMATION_DURATION);
    }
  }

  function finishRoll() {
    setDiceState((prev) => {
      const newState = DiceService.finishRolling(prev);
      
      // Vibración extra para críticos
      if (newState.currentValue === 20) {
        Vibration.vibrate([0, 50, 50, 50]);
      } else if (newState.currentValue === 1) {
        Vibration.vibrate([0, 200]);
      }
      
      return newState;
    });
  }

  /**
   * Mensaje según el resultado
   */
  const getResultMessage = (value: DiceValue): string => {
    if (value === 20) return '¡Crítico Perfecto!';
    if (value === 1) return '¡Fallo Crítico!';
    if (value >= 15) return 'Excelente';
    if (value >= 10) return 'Éxito';
    return 'Bajo';
  };

  return (
    <Container variant="default" className="bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-center gap-3 mb-3">
          <View className="bg-purple-600 p-3 rounded-full">
            <Dices size={32} color="#ffffff" />
          </View>
        </View>
        <Text variant="h1" weight="bold" className="text-center text-gray-800 dark:text-white mb-1">
          Chrono Dice D20
        </Text>
        <Text variant="caption" className="text-center text-purple-600 dark:text-purple-400 mb-2">
          Dado de 20 caras
        </Text>
        
        {/* Toggle 2D/3D */}
        <View className="flex-row items-center justify-center gap-3 mt-4">
          <Text variant="body" className="text-gray-600 dark:text-gray-300">
            2D
          </Text>
          <Switch
            value={use3D}
            onValueChange={setUse3D}
            trackColor={{ false: '#d1d5db', true: '#9333ea' }}
            thumbColor={use3D ? '#ffffff' : '#f3f4f6'}
            disabled={diceState.isRolling}
          />
          <View className="flex-row items-center gap-1">
            <Box size={16} color="#9333ea" />
            <Text variant="body" className="text-purple-600 dark:text-purple-400">
              3D
            </Text>
          </View>
        </View>
        
        <Text 
          variant="body" 
          className="text-center text-gray-600 dark:text-gray-300 mt-2"
        >
          Agita o toca para lanzar
        </Text>
      </View>

      {/* Área del dado */}
      <Container variant="centered" className="flex-1 px-6">
        <TouchableOpacity 
          onPress={handleTap}
          activeOpacity={0.8}
          disabled={diceState.isRolling}
        >
          {use3D ? (
            // ========== DADO 3D ==========
            <Dice3DRenderer
              value={displayValue}
              isRolling={diceState.isRolling}
              size={280}
            />
          ) : (
            // ========== DADO 2D ==========
            <Animated.View
              style={{
                transform: [
                  { scale: scaleAnim },
                  {
                    rotateY: rotationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                  {
                    rotateZ: rotationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              }}
            >
              <DiceFace
                value={displayValue}
                size={220}
                isRolling={diceState.isRolling}
              />
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Instrucciones e info */}
        {!diceState.isRolling && (
          <View className="mt-12 items-center">
            <View className="flex-row items-center gap-2 mb-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-md">
              <Smartphone size={20} color="#9333ea" />
              <Text variant="body" weight="medium" className="text-purple-600">
                Sacude o toca
              </Text>
            </View>
            
            {/* Tarjeta de resultado */}
            <View className="bg-white dark:bg-gray-800 px-8 py-4 rounded-2xl shadow-lg">
              <View className="flex-row items-center justify-center gap-2 mb-2">
                {diceState.currentValue === 20 && (
                  <Trophy size={24} color="#fbbf24" />
                )}
                {diceState.currentValue === 1 && (
                  <Skull size={24} color="#ef4444" />
                )}
                <Text variant="h1" weight="bold" className="text-center text-gray-800 dark:text-white">
                  {diceState.currentValue}
                </Text>
              </View>
              <Text variant="body" weight="medium" className="text-center text-gray-600 dark:text-gray-400">
                {getResultMessage(diceState.currentValue)}
              </Text>
            </View>

            {/* Leyenda de colores (solo 2D) */}
            {!use3D && (
              <View className="mt-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                <Text variant="caption" className="text-gray-500 dark:text-gray-400 text-center mb-2">
                  Colores del dado
                </Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                  <View className="flex-row items-center gap-1">
                    <View className="w-3 h-3 rounded-full bg-yellow-500" />
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">20</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <View className="w-3 h-3 rounded-full bg-green-500" />
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">15-19</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">10-14</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <View className="w-3 h-3 rounded-full bg-gray-500" />
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">2-9</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <View className="w-3 h-3 rounded-full bg-red-500" />
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">1</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Indicador rodando */}
        {diceState.isRolling && (
          <View className="mt-12 bg-purple-100 dark:bg-purple-900/30 px-8 py-4 rounded-2xl">
            <Text 
              variant="h2" 
              weight="bold" 
              className="text-center text-purple-600 dark:text-purple-400"
            >
              Lanzando D20...
            </Text>
          </View>
        )}
      </Container>

      {/* Panel inferior */}
      <View className="px-6 pb-8">
        <SensorStatus
          isAvailable={isAvailable}
          data={accelerometerData}
          magnitude={magnitude}
          detailed={false}
        />

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <Text variant="caption" className="text-gray-500 dark:text-gray-400 text-center mb-1">
              Modo
            </Text>
            <Text variant="body" weight="bold" className="text-center text-purple-600">
              {use3D ? '3D' : '2D'}
            </Text>
          </View>
          
          <View className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <Text variant="caption" className="text-gray-500 dark:text-gray-400 text-center mb-1">
              Último
            </Text>
            <Text variant="body" weight="bold" className="text-center text-purple-600">
              {diceState.currentValue}
            </Text>
          </View>
        </View>
      </View>
    </Container>
  );
}