import { StatusBar } from 'expo-status-bar';
import { DiceGame } from '../scr/presentation/components/organisms/DiceGame';
import "../global.css";

/**
 * Pantalla principal de la aplicación
 * 
 * Muestra el componente DiceGame que contiene toda la funcionalidad.
 */
export default function Index() {
  return (
    <>
      <StatusBar style="auto" />
      <DiceGame />
    </>
  );
}