import { AccelerometerData } from '../models/Dice';

/**
 * Utilidades matemáticas para cálculos vectoriales
 * 
 * Este módulo contiene funciones puras para operaciones matemáticas
 * relacionadas con vectores de aceleración, sin dependencias externas.
 */

/**
 * Calcula la magnitud (norma euclidiana) de un vector tridimensional
 * 
 * Fórmula: ||v|| = √(x² + y² + z²)
 * 
 * Esta función es crucial para detectar la intensidad total del movimiento
 * independientemente de la orientación del dispositivo.
 * 
 * @param data - Datos del acelerómetro con componentes x, y, z
 * @returns La magnitud del vector en unidades de g
 * 
 * @example
 * // Dispositivo en reposo (solo gravedad en eje Y)
 * calculateMagnitude({ x: 0, y: -1, z: 0 }) // ≈ 1.0
 * 
 * @example
 * // Dispositivo sacudiéndose
 * calculateMagnitude({ x: 1.5, y: -1, z: 0.8 }) // ≈ 1.95
 */
export function calculateMagnitude(data: AccelerometerData): number {
  const { x, y, z } = data;
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calcula la magnitud sin la componente de gravedad
 * 
 * En reposo, el acelerómetro detecta ~1g de gravedad. Esta función
 * resta la gravedad base para obtener solo la aceleración del movimiento.
 * 
 * @param magnitude - Magnitud total del vector
 * @param gravityBase - Valor base de gravedad (típicamente 1.0)
 * @returns Magnitud del movimiento sin gravedad
 */
export function calculateMovementMagnitude(
  magnitude: number, 
  gravityBase: number = 1.0
): number {
  return Math.abs(magnitude - gravityBase);
}

/**
 * Normaliza un vector a longitud unitaria
 * 
 * @param data - Vector a normalizar
 * @returns Vector normalizado (magnitud = 1) o null si magnitud es 0
 */
export function normalizeVector(
  data: AccelerometerData
): AccelerometerData | null {
  const magnitude = calculateMagnitude(data);
  
  if (magnitude === 0) return null;
  
  return {
    x: data.x / magnitude,
    y: data.y / magnitude,
    z: data.z / magnitude,
  };
}

/**
 * Calcula el producto punto (dot product) de dos vectores
 * 
 * Útil para calcular ángulos entre vectores o proyecciones.
 * 
 * @param v1 - Primer vector
 * @param v2 - Segundo vector
 * @returns Producto punto
 */
export function dotProduct(
  v1: AccelerometerData, 
  v2: AccelerometerData
): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}