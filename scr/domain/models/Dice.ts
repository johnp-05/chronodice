/**
 * Modelo de dominio para el dado
 * 
 * Define los tipos y estructuras de datos relacionados con el dado
 * y el acelerómetro, siguiendo principios de Domain-Driven Design.
 */

/**
 * Tipo que representa el valor de una cara del dado (1-6)
 */
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Interfaz que representa las lecturas del acelerómetro en tres ejes
 * 
 * @property x - Aceleración en el eje X (lateral)
 * @property y - Aceleración en el eje Y (vertical)
 * @property z - Aceleración en el eje Z (profundidad)
 * 
 * Nota: Los valores están en unidades de g (gravedad terrestre)
 * donde 1g ≈ 9.8 m/s²
 */
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

/**
 * Interfaz que representa el estado completo del dado
 */
export interface DiceState {
  currentValue: DiceValue;
  isRolling: boolean;
  lastRollTimestamp: number;
}

/**
 * Configuración para la detección de sacudidas
 */
export interface ShakeConfig {
  /**
   * Umbral de magnitud para detectar una sacudida
   * Valor típico: 1.5 - 2.0g
   */
  threshold: number;
  
  /**
   * Tiempo mínimo entre sacudidas detectadas (ms)
   * Previene múltiples detecciones del mismo movimiento
   */
  cooldownMs: number;
}

/**
 * Constantes del dominio
 */
export const DICE_CONSTANTS = {
  MIN_VALUE: 1 as DiceValue,
  MAX_VALUE: 6 as DiceValue,
  ROLL_ANIMATION_DURATION: 600, // ms
  DEFAULT_SHAKE_THRESHOLD: 1.8, // g
  DEFAULT_COOLDOWN: 500, // ms
} as const;