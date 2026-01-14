import { AccelerometerData, ShakeConfig, DICE_CONSTANTS } from '../models/Dice';
import { calculateMagnitude } from '../utils/VectorMath';

/**
 * Servicio de dominio para detectar sacudidas del dispositivo
 * 
 * Implementa la lógica de negocio para determinar cuándo el usuario
 * ha sacudido el dispositivo lo suficiente como para lanzar el dado.
 * 
 * Principios de diseño:
 * - Sin dependencias externas (pura lógica de dominio)
 * - Stateful: mantiene el estado del último shake detectado
 * - Configurable mediante ShakeConfig
 */
export class ShakeDetectionService {
  private config: ShakeConfig;
  private lastShakeTime: number = 0;

  constructor(config?: Partial<ShakeConfig>) {
    this.config = {
      threshold: config?.threshold ?? DICE_CONSTANTS.DEFAULT_SHAKE_THRESHOLD,
      cooldownMs: config?.cooldownMs ?? DICE_CONSTANTS.DEFAULT_COOLDOWN,
    };
  }

  /**
   * Detecta si los datos del acelerómetro indican una sacudida
   * 
   * Algoritmo:
   * 1. Calcula la magnitud del vector de aceleración
   * 2. Compara con el umbral configurado
   * 3. Verifica que haya pasado el tiempo de cooldown
   * 4. Si se detecta shake, actualiza el timestamp
   * 
   * @param data - Datos actuales del acelerómetro
   * @returns true si se detectó una sacudida válida
   * 
   * @example
   * const detector = new ShakeDetectionService();
   * const data = { x: 2.1, y: -0.5, z: 1.2 };
   * if (detector.detectShake(data)) {
   *   console.log('¡Sacudida detectada!');
   * }
   */
  public detectShake(data: AccelerometerData): boolean {
    const magnitude = calculateMagnitude(data);
    const now = Date.now();
    
    // Verifica si la magnitud supera el umbral
    const isShaking = magnitude > this.config.threshold;
    
    // Verifica que haya pasado el tiempo de cooldown
    const cooldownPassed = now - this.lastShakeTime > this.config.cooldownMs;
    
    if (isShaking && cooldownPassed) {
      this.lastShakeTime = now;
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene la magnitud actual sin modificar el estado
   * 
   * Útil para debugging o mostrar información al usuario
   * 
   * @param data - Datos del acelerómetro
   * @returns Magnitud actual
   */
  public getCurrentMagnitude(data: AccelerometerData): number {
    return calculateMagnitude(data);
  }

  /**
   * Actualiza la configuración del detector
   * 
   * @param config - Nueva configuración parcial o completa
   */
  public updateConfig(config: Partial<ShakeConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): ShakeConfig {
    return { ...this.config };
  }

  /**
   * Resetea el estado del detector (útil para testing)
   */
  public reset(): void {
    this.lastShakeTime = 0;
  }
}