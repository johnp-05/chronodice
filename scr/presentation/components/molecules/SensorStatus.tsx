import React from 'react';
import { View } from 'react-native';
import { Activity, Gauge } from 'lucide-react-native';
import { Text } from '../atoms/Text';
import { AccelerometerData } from '../../../domain/models/Dice';

/**
 * Molécula: SensorStatus
 * 
 * Muestra información del estado del acelerómetro.
 * Combina íconos (lucide) con texto para crear un indicador informativo.
 * 
 * Útil para debugging y feedback al usuario.
 */

interface SensorStatusProps {
  /**
   * Si el sensor está disponible
   */
  isAvailable: boolean;
  
  /**
   * Datos actuales del acelerómetro
   */
  data: AccelerometerData;
  
  /**
   * Magnitud actual del movimiento
   */
  magnitude: number;
  
  /**
   * Si se debe mostrar información detallada
   */
  detailed?: boolean;
}

export function SensorStatus({ 
  isAvailable, 
  data, 
  magnitude,
  detailed = false 
}: SensorStatusProps) {
  if (!isAvailable) {
    return (
      <View className="flex-row items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
        <Activity size={20} color="#ef4444" />
        <Text variant="caption" className="text-red-600 dark:text-red-400">
          Acelerómetro no disponible
        </Text>
      </View>
    );
  }

  return (
    <View className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {/* Header con ícono */}
      <View className="flex-row items-center gap-2 mb-2">
        <Gauge size={20} color="#0ea5e9" />
        <Text variant="caption" weight="semibold" className="text-primary-600">
          Estado del Sensor
        </Text>
      </View>

      {/* Magnitud */}
      <View className="flex-row justify-between items-center mb-1">
        <Text variant="caption" className="text-gray-600 dark:text-gray-400">
          Magnitud:
        </Text>
        <Text variant="caption" weight="bold" className="font-mono">
          {magnitude.toFixed(3)} g
        </Text>
      </View>

      {/* Datos detallados (opcional) */}
      {detailed && (
        <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row justify-between items-center">
            <Text variant="caption" className="text-gray-600 dark:text-gray-400">
              X:
            </Text>
            <Text variant="caption" className="font-mono">
              {data.x.toFixed(3)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="caption" className="text-gray-600 dark:text-gray-400">
              Y:
            </Text>
            <Text variant="caption" className="font-mono">
              {data.y.toFixed(3)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="caption" className="text-gray-600 dark:text-gray-400">
              Z:
            </Text>
            <Text variant="caption" className="font-mono">
              {data.z.toFixed(3)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}