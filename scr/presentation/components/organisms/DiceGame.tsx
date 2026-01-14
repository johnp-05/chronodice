import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Vibration, TouchableOpacity } from 'react-native';
import { Dices, Smartphone } from 'lucide-react-native';
import { Container } from '../atoms/Container';
import { Text } from '../atoms/Text';
import { DiceFace } from '../molecules/DiceFace';
import { SensorStatus } from '../molecules/SensorStatus';
import { DiceValue, DiceState, DICE_CONSTANTS } from '../../../domain/models/Dice';
import { DiceService } from '../../../domain/services/DiceService';
import { useShakeDetection } from '../../../infrastructure/hooks/useShakeDetection';

/**
 * Organismo: DiceGame (Versión Mejorada)
 * 
 * Mejoras:
 * - Valores intermedios durante la animación
 * - Modo táctil alternativo
 * - Mejor feedback visual
 * - Colores más vibrantes
 */

export function DiceGame() {
  // Estado del dado
  const [diceState, setDiceState] = useState<DiceState>(
    DiceService.createInitialState()
  );

  // Valor mostrado durante la animación
  const [displayValue, setDisplayValue] = useState<DiceValue>(1);

  // Animación de escala (bounce effect)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Hook de detección de sacudidas
  const { accelerometerData, magnitude, isAvailable } = useShakeDetection(
    {
      threshold: DICE_CONSTANTS.DEFAULT_SHAKE_THRESHOLD,
      cooldownMs: DICE_CONSTANTS.DEFAULT_COOLDOWN,
    },
    handleShake
  );

  /**
   * Efecto que cambia valores aleatorios durante la animación
   */
  useEffect(() => {
    if (diceState.isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(DiceService.rollDice());
      }, 80); // Cambia cada 80ms

      return () => clearInterval(interval);
    } else {
      // Cuando termina, muestra el valor final
      setDisplayValue(diceState.currentValue);
    }
  }, [diceState.isRolling, diceState.currentValue]);

  /**
   * Maneja la detección de sacudida
   */
  function handleShake() {
    if (diceState.isRolling) return;
    rollDice();
  }

  /**
   * Maneja el toque manual
   */
  function handleTap() {
    if (diceState.isRolling) return;
    rollDice();
  }

  /**
   * Lanza el dado con animación mejorada
   */
  function rollDice() {
    // Feedback háptico
    Vibration.vibrate(100);

    // Actualiza estado a "rodando"
    setDiceState(DiceService.createRolledState(diceState));

    // Animación combinada: rotación + escala
    rotationAnim.setValue(0);
    scaleAnim.setValue(1);

    Animated.parallel([
      // Rotación rápida
      Animated.timing(rotationAnim, {
        toValue: 2, // 2 rotaciones completas
        duration: DICE_CONSTANTS.ROLL_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      // Efecto bounce
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: DICE_CONSTANTS.ROLL_ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Al terminar, marca como no rodando
      setDiceState((prev) => DiceService.finishRolling(prev));
    });
  }

  return (
    <Container variant="default" className="bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con diseño mejorado */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-center gap-3 mb-3">
          <View className="bg-primary-500 p-3 rounded-full">
            <Dices size={32} color="#ffffff" />
          </View>
        </View>
        <Text variant="h1" weight="bold" className="text-center text-gray-800 dark:text-white mb-2">
          Chrono Dice
        </Text>
        <Text 
          variant="body" 
          className="text-center text-gray-600 dark:text-gray-300"
        >
          Agita tu dispositivo o toca el dado
        </Text>
      </View>

      {/* Área principal del dado */}
      <Container variant="centered" className="flex-1 px-6">
        <TouchableOpacity 
          onPress={handleTap}
          activeOpacity={0.8}
          disabled={diceState.isRolling}
        >
          <Animated.View
            style={{
              transform: [
                { scale: scaleAnim },
                {
                  rotate: rotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <DiceFace
              value={displayValue}
              size={200}
              isRolling={diceState.isRolling}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Instrucciones visuales mejoradas */}
        {!diceState.isRolling && (
          <View className="mt-10 items-center">
            <View className="flex-row items-center gap-2 mb-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-md">
              <Smartphone size={20} color="#0ea5e9" />
              <Text variant="body" weight="medium" className="text-primary-600">
                Sacude o toca
              </Text>
            </View>
            
            <View className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-2xl">
              <Text variant="h2" weight="bold" className="text-center text-gray-800 dark:text-white">
                {diceState.currentValue}
              </Text>
              <Text variant="caption" className="text-center text-gray-500 dark:text-gray-400 mt-1">
                Último resultado
              </Text>
            </View>
          </View>
        )}

        {/* Indicador de rodando mejorado */}
        {diceState.isRolling && (
          <View className="mt-10 bg-primary-100 dark:bg-primary-900/30 px-8 py-4 rounded-2xl">
            <Text 
              variant="h2" 
              weight="bold" 
              className="text-center text-primary-600 dark:text-primary-400"
            >
              Lanzando...
            </Text>
          </View>
        )}
      </Container>

      {/* Panel de información del sensor con diseño mejorado */}
      <View className="px-6 pb-8">
        <SensorStatus
          isAvailable={isAvailable}
          data={accelerometerData}
          magnitude={magnitude}
          detailed={false}
        />

        {/* Información en tarjetas */}
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <Text variant="caption" className="text-gray-500 dark:text-gray-400 text-center mb-1">
              Umbral
            </Text>
            <Text variant="body" weight="bold" className="text-center text-gray-800 dark:text-white">
              {DICE_CONSTANTS.DEFAULT_SHAKE_THRESHOLD.toFixed(1)} g
            </Text>
          </View>
          
          <View className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <Text variant="caption" className="text-gray-500 dark:text-gray-400 text-center mb-1">
              Resultado
            </Text>
            <Text variant="body" weight="bold" className="text-center text-primary-600">
              {diceState.currentValue}
            </Text>
          </View>
        </View>
      </View>
    </Container>
  );
}