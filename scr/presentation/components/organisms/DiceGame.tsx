import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Vibration } from 'react-native';
import { Dices, Smartphone } from 'lucide-react-native';
import { Container } from '../atoms/Container';
import { Text } from '../atoms/Text';
import { DiceFace } from '../molecules/DiceFace';
import { SensorStatus } from '../molecules/SensorStatus';
import { DiceValue, DiceState, DICE_CONSTANTS } from '../../../domain/models/Dice';
import { DiceService } from '../../../domain/services/DiceService';
import { useShakeDetection } from '../../../infrastructure/hooks/useShakeDetection';

/**
 * Organismo: DiceGame
 * 
 * Componente principal que orquesta toda la funcionalidad del dado.
 * Combina moléculas y átomos para crear la experiencia completa.
 * 
 * Responsabilidades:
 * - Gestionar el estado del dado
 * - Integrar la detección de sacudidas
 * - Coordinar animaciones
 * - Proporcionar feedback háptico
 */

export function DiceGame() {
  // Estado del dado
  const [diceState, setDiceState] = useState<DiceState>(
    DiceService.createInitialState()
  );

  // Animación de rotación
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
   * Maneja la detección de sacudida
   */
  function handleShake() {
    // Evita lanzamientos múltiples si ya está rodando
    if (diceState.isRolling) return;

    // Lanza el dado
    rollDice();
  }

  /**
   * Lanza el dado con animación
   */
  function rollDice() {
    // Feedback háptico
    Vibration.vibrate(100);

    // Actualiza estado a "rodando"
    setDiceState(DiceService.createRolledState(diceState));

    // Resetea y ejecuta animación de rotación
    rotationAnim.setValue(0);
    Animated.sequence([
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: DICE_CONSTANTS.ROLL_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Al terminar la animación, marca como no rodando
      setDiceState((prev) => DiceService.finishRolling(prev));
    });
  }

  return (
    <Container variant="default" className="bg-blue-50 dark:bg-gray-900">
      {/* Header */}
      <View className="pt-16 pb-8 px-6">
        <View className="flex-row items-center justify-center gap-3 mb-2">
          <Dices size={32} color="#0ea5e9" />
          <Text variant="h1" weight="bold" className="text-primary-600">
            Chrono Dice
          </Text>
        </View>
        <Text 
          variant="body" 
          className="text-center text-gray-600 dark:text-gray-400"
        >
          Agita tu dispositivo para lanzar el dado
        </Text>
      </View>

      {/* Área principal del dado */}
      <Container variant="centered" className="flex-1">
        <DiceFace
          value={diceState.currentValue}
          size={180}
          isRolling={diceState.isRolling}
          rotationValue={rotationAnim}
        />

        {/* Instrucción visual */}
        {!diceState.isRolling && (
          <View className="mt-8 flex-row items-center gap-2 opacity-60">
            <Smartphone size={20} color="#6b7280" />
            <Text variant="caption" className="text-gray-500 dark:text-gray-400">
              Sacude tu teléfono
            </Text>
          </View>
        )}

        {/* Indicador de rodando */}
        {diceState.isRolling && (
          <View className="mt-8">
            <Text 
              variant="h2" 
              weight="semibold" 
              className="text-primary-600 animate-pulse"
            >
              Lanzando...
            </Text>
          </View>
        )}
      </Container>

      {/* Panel de información del sensor */}
      <View className="px-6 pb-8">
        <SensorStatus
          isAvailable={isAvailable}
          data={accelerometerData}
          magnitude={magnitude}
          detailed={false}
        />

        {/* Información adicional */}
        <View className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Text variant="caption" className="text-gray-600 dark:text-gray-400 text-center">
            Umbral de detección: {DICE_CONSTANTS.DEFAULT_SHAKE_THRESHOLD.toFixed(1)} g
          </Text>
          <Text variant="caption" className="text-gray-600 dark:text-gray-400 text-center mt-1">
            Última tirada: {diceState.currentValue}
          </Text>
        </View>
      </View>
    </Container>
  );
}