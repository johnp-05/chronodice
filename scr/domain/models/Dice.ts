/**
 * Modelo de dominio para el dado D20
 * 
 * Define los tipos y estructuras de datos relacionados con el dado de 20 caras
 * y el acelerómetro, siguiendo principios de Domain-Driven Design.
 */

/**
 * Tipo que representa el valor de una cara del dado D20 (1-20)
 */
export type DiceValue = 
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

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
 * Constantes del dominio para D20
 */
export const DICE_CONSTANTS = {
  MIN_VALUE: 1 as DiceValue,
  MAX_VALUE: 20 as DiceValue, // Cambiado de 6 a 20
  ROLL_ANIMATION_DURATION: 800, // Un poco más largo por más caras
  DEFAULT_SHAKE_THRESHOLD: 1.8,
  DEFAULT_COOLDOWN: 500,
} as const;