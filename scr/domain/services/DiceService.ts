import { DiceValue, DiceState, DICE_CONSTANTS } from '../models/Dice';

/**
 * Servicio de dominio para la lógica del dado D20
 * 
 * Maneja toda la lógica relacionada con el estado y comportamiento
 * del dado de 20 caras.
 */
export class DiceService {
  /**
   * Genera un valor aleatorio válido para el dado D20 (1-20)
   * 
   * @returns Un valor válido del dado
   * 
   * @example
   * const value = DiceService.rollDice(); // 1-20
   */
  public static rollDice(): DiceValue {
    const min = DICE_CONSTANTS.MIN_VALUE;
    const max = DICE_CONSTANTS.MAX_VALUE;
    
    // Genera número entre 1 y 20 (inclusive)
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return randomValue as DiceValue;
  }

  /**
   * Valida si un número es un valor válido para el dado
   * 
   * @param value - Valor a validar
   * @returns true si el valor está entre 1 y 20
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
   * Determina el color del dado según el valor
   * 
   * - 20: Oro (crítico perfecto)
   * - 1: Rojo (fallo crítico)
   * - 15-19: Verde (éxito alto)
   * - 10-14: Azul (éxito medio)
   * - 2-9: Gris (bajo)
   */
  public static getDiceColor(value: DiceValue): string {
    if (value === 20) return '#fbbf24'; // Oro
    if (value === 1) return '#ef4444'; // Rojo
    if (value >= 15) return '#10b981'; // Verde
    if (value >= 10) return '#3b82f6'; // Azul
    return '#6b7280'; // Gris
  }

  /**
   * Obtiene el color del texto según el valor
   */
  public static getTextColor(value: DiceValue): string {
    if (value === 20) return '#92400e'; // Dorado oscuro
    if (value === 1) return '#ffffff'; // Blanco
    if (value >= 15) return '#ffffff'; // Blanco
    if (value >= 10) return '#ffffff'; // Blanco
    return '#ffffff'; // Blanco
  }
}