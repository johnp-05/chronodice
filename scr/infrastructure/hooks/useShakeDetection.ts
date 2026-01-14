import { useState, useEffect, useRef, useCallback } from 'react';
import { AccelerometerData, ShakeConfig } from '../../domain/models/Dice';
import { ShakeDetectionService } from '../../domain/services/ShakeDetectionService';
import { useAccelerometer } from './useAccelerometer';

/**
 * Tipo para el callback cuando se detecta una sacudida
 */
type ShakeCallback = () => void;

/**
 * Custom hook para detectar sacudidas del dispositivo
 * 
 * Combina el hook useAccelerometer con el ShakeDetectionService
 * para proporcionar una interfaz simple de uso.
 * 
 * @param config - Configuración opcional para la detección
 * @param onShake - Callback que se ejecuta cuando se detecta shake
 * @returns Objeto con datos del sensor y magnitud actual
 * 
 * @example
 * function DiceComponent() {
 *   const { magnitude } = useShakeDetection(
 *     { threshold: 2.0, cooldownMs: 500 },
 *     () => {
 *       console.log('¡Dispositivo sacudido!');
 *       // Lanzar dado
 *     }
 *   );
 *   
 *   return <Text>Magnitud: {magnitude.toFixed(2)}</Text>;
 * }
 */
export function useShakeDetection(
  config?: Partial<ShakeConfig>,
  onShake?: ShakeCallback
) {
  const { data, isAvailable } = useAccelerometer(100);
  const [magnitude, setMagnitude] = useState<number>(0);
  
  // Usamos useRef para mantener la instancia del servicio entre renders
  const detectorRef = useRef<ShakeDetectionService>(
    new ShakeDetectionService(config)
  );

  // Actualiza la configuración si cambia
  useEffect(() => {
    if (config) {
      detectorRef.current.updateConfig(config);
    }
  }, [config]);

  // Detecta sacudidas cuando cambian los datos del acelerómetro
  useEffect(() => {
    if (!isAvailable) return;

    const detector = detectorRef.current;
    
    // Calcula la magnitud actual
    const currentMagnitude = detector.getCurrentMagnitude(data);
    setMagnitude(currentMagnitude);

    // Detecta sacudida
    const shakeDetected = detector.detectShake(data);
    
    if (shakeDetected && onShake) {
      onShake();
    }
  }, [data, isAvailable, onShake]);

  /**
   * Permite actualizar la configuración desde fuera del hook
   */
  const updateConfig = useCallback((newConfig: Partial<ShakeConfig>) => {
    detectorRef.current.updateConfig(newConfig);
  }, []);

  /**
   * Resetea el estado del detector
   */
  const reset = useCallback(() => {
    detectorRef.current.reset();
  }, []);

  return {
    accelerometerData: data,
    magnitude,
    isAvailable,
    updateConfig,
    reset,
  };
}