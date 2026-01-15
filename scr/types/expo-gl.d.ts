/**
 * Extensión de tipos para Expo GL
 * 
 * Expo GL añade métodos adicionales al contexto WebGL estándar
 * que no están presentes en los tipos de TypeScript por defecto.
 */

declare global {
    interface WebGLRenderingContext {
      /**
       * Método específico de Expo GL para finalizar un frame
       * 
       * Este método debe ser llamado al final de cada ciclo de renderizado
       * para indicar que el frame está completo y listo para ser presentado.
       */
      endFrameEXP(): void;
    }
  }
  
  export {};