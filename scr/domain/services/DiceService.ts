import { DiceValue, DiceState, DICE_CONSTANTS } from '../models/Dice';

/**
 * Servicio de dominio para la lógica del dado
 * 
 * Maneja toda la lógica relacionada con el estado y comportamiento
 * del dado, incluyendo generación de números aleatorios y validaciones.
 */
export class DiceService {
  /**
   * Genera un valor aleatorio válido para el dado (1-6)
   * 
   * Utiliza Math.random() para generar un número aleatorio
   * y lo mapea al rango [1, 6].
   * 
   * @returns Un valor válido del dado
   * 
   * @example
   * const value = DiceService.rollDice(); // 1, 2, 3, 4, 5, o 6
   */
  public static rollDice(): DiceValue {
    const min = DICE_CONSTANTS.MIN_VALUE;
    const max = DICE_CONSTANTS.MAX_VALUE;
    
    // Genera número entre 1 y 6 (inclusive)
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return randomValue as DiceValue;
  }

  /**
   * Valida si un número es un valor válido para el dado
   * 
   * @param value - Valor a validar
   * @returns true si el valor está entre 1 y 6
   */
  public static isValidDiceValue(value: number): value is DiceValue {
    return (
      Number.isInteger(value) &&
      value >= DICE_CONSTANTS.MIN_VALUE &&
      value <= DICE_CONSTANTS.MAX_VALUE
    );
  }

  /**
   * Crea un estado inicial del dado
   * 
   * @param initialValue - Valor inicial opcional (default: 1)
   * @returns Estado inicial del dado
   */
  public static createInitialState(initialValue: DiceValue = 1): DiceState {
    return {
      currentValue: initialValue,
      isRolling: false,
      lastRollTimestamp: 0,
    };
  }

  /**
   * Crea un nuevo estado después de lanzar el dado
   * 
   * @param previousState - Estado anterior del dado
   * @returns Nuevo estado con valor aleatorio y timestamp actualizado
   */
  public static createRolledState(previousState: DiceState): DiceState {
    return {
      currentValue: this.rollDice(),
      isRolling: true,
      lastRollTimestamp: Date.now(),
    };
  }

  /**
   * Finaliza la animación de lanzamiento
   * 
   * @param currentState - Estado actual del dado
   * @returns Estado con isRolling en false
   */
  public static finishRolling(currentState: DiceState): DiceState {
    return {
      ...currentState,
      isRolling: false,
    };
  }

  /**
   * Obtiene la configuración de puntos para cada cara del dado
   * 
   * Retorna las posiciones de los puntos en cada cara (1-6)
   * en un sistema de coordenadas 3x3.
   * 
   * @param value - Valor de la cara del dado
   * @returns Array de posiciones [fila, columna] de los puntos
   */
  public static getDotPositions(value: DiceValue): [number, number][] {
    const positions: Record<DiceValue, [number, number][]> = {
      1: [[1, 1]], // Centro
      2: [[0, 0], [2, 2]], // Diagonal
      3: [[0, 0], [1, 1], [2, 2]], // Diagonal con centro
      4: [[0, 0], [0, 2], [2, 0], [2, 2]], // Esquinas
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], // Esquinas + centro
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]], // Dos columnas
    };

    return positions[value];
  }
}