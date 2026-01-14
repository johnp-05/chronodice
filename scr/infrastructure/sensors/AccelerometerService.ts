import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import { AccelerometerData } from '../../domain/models/Dice';

/**
 * Servicio de infraestructura para acceso al acelerómetro
 * 
 * Esta clase encapsula la comunicación con el hardware del dispositivo
 * mediante expo-sensors, proporcionando una interfaz limpia para
 * la capa de dominio.
 * 
 * Responsabilidades:
 * - Iniciar/detener el sensor
 * - Configurar la frecuencia de actualización
 * - Transformar datos del sensor al formato del dominio
 * - Verificar disponibilidad del sensor
 */
export class AccelerometerService {
  private static readonly DEFAULT_UPDATE_INTERVAL = 100; // ms (10 Hz)

  /**
   * Verifica si el acelerómetro está disponible en el dispositivo
   * 
   * @returns Promise que resuelve a true si está disponible
   */
  public static async isAvailable(): Promise<boolean> {
    try {
      return await Accelerometer.isAvailableAsync();
    } catch (error) {
      console.error('Error checking accelerometer availability:', error);
      return false;
    }
  }

  /**
   * Configura el intervalo de actualización del sensor
   * 
   * Frecuencias comunes:
   * - 16ms (60 Hz): Alta frecuencia, mayor consumo
   * - 100ms (10 Hz): Balanceado para detección de gestos
   * - 200ms (5 Hz): Bajo consumo
   * 
   * @param intervalMs - Intervalo en milisegundos
   */
  public static setUpdateInterval(intervalMs: number = this.DEFAULT_UPDATE_INTERVAL): void {
    Accelerometer.setUpdateInterval(intervalMs);
  }

  /**
   * Suscribe un listener a las actualizaciones del acelerómetro
   * 
   * @param callback - Función que recibe los datos del acelerómetro
   * @returns Suscripción que puede ser cancelada
   * 
   * @example
   * const subscription = AccelerometerService.subscribe((data) => {
   *   console.log('Aceleración:', data);
   * });
   * 
   * // Más tarde...
   * subscription.remove();
   */
  public static subscribe(
    callback: (data: AccelerometerData) => void
  ): { remove: () => void } {
    return Accelerometer.addListener((measurement: AccelerometerMeasurement) => {
      const data = this.transformMeasurement(measurement);
      callback(data);
    });
  }

  /**
   * Transforma los datos del sensor al formato del dominio
   * 
   * Expo Sensors usa la convención de coordenadas del sistema operativo:
   * - x: positivo hacia la derecha del dispositivo
   * - y: positivo hacia arriba
   * - z: positivo hacia afuera de la pantalla
   * 
   * @param measurement - Medición del sensor
   * @returns Datos en formato del dominio
   */
  private static transformMeasurement(
    measurement: AccelerometerMeasurement
  ): AccelerometerData {
    return {
      x: measurement.x,
      y: measurement.y,
      z: measurement.z,
    };
  }

  /**
   * Detiene todas las actualizaciones del acelerómetro
   * 
   * Importante llamar cuando el componente se desmonta
   * para evitar fugas de memoria y ahorrar batería.
   */
  public static removeAllListeners(): void {
    Accelerometer.removeAllListeners();
  }
}