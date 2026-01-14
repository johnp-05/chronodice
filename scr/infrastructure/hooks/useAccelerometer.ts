import { useState, useEffect } from 'react';
import { AccelerometerData } from '../../domain/models/Dice';
import { AccelerometerService } from '../sensors/AccelerometerService';

/**
 * Custom hook para acceder a los datos del acelerómetro
 * 
 * Encapsula la lógica de suscripción y limpieza del acelerómetro,
 * siguiendo el patrón de hooks de React para manejo de efectos.
 * 
 * @param updateInterval - Intervalo de actualización en ms (default: 100)
 * @returns Objeto con datos actuales y estado de disponibilidad
 * 
 * @example
 * function MyComponent() {
 *   const { data, isAvailable } = useAccelerometer(100);
 *   
 *   if (!isAvailable) {
 *     return <Text>Acelerómetro no disponible</Text>;
 *   }
 *   
 *   return <Text>X: {data.x.toFixed(2)}</Text>;
 * }
 */
export function useAccelerometer(updateInterval: number = 100) {
  const [data, setData] = useState<AccelerometerData>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    // Función asíncrona para verificar disponibilidad e iniciar sensor
    const initializeSensor = async () => {
      const available = await AccelerometerService.isAvailable();
      setIsAvailable(available);

      if (!available) {
        console.warn('Acelerómetro no disponible en este dispositivo');
        return;
      }

      // Configura el intervalo de actualización
      AccelerometerService.setUpdateInterval(updateInterval);

      // Suscribe al sensor
      subscription = AccelerometerService.subscribe((newData) => {
        setData(newData);
      });
    };

    initializeSensor();

    // Cleanup: remueve listeners cuando el componente se desmonta
    return () => {
      if (subscription) {
        subscription.remove();
      }
      AccelerometerService.removeAllListeners();
    };
  }, [updateInterval]);

  return {
    data,
    isAvailable,
  };
}