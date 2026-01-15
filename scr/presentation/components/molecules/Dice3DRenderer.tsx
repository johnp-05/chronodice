import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { DiceValue } from '../../../domain/models/Dice';
require('../../../../assets/3D/d20_dice_w20_wurfel_3d_model_free.glb')
/**
 * Molécula: Dice3DRenderer
 * 
 * Renderiza un dado D20 en 3D usando Three.js y WebGL
 * 
 * Características:
 * - Modelo GLB del dado icosaedro
 * - Animación de rotación suave
 * - Iluminación realista
 * - Transiciones entre valores
 */

/**
 * Extensión del tipo WebGLRenderingContext para incluir métodos de Expo GL
 */
interface ExpoWebGLRenderingContext extends WebGLRenderingContext {
  endFrameEXP(): void;
}

interface Dice3DRendererProps {
  /**
   * Valor actual del dado (1-20)
   */
  value: DiceValue;
  
  /**
   * Si el dado está rodando
   */
  isRolling: boolean;
  
  /**
   * Tamaño del contenedor
   */
  size?: number;
}

/**
 * Rotaciones predefinidas para cada cara del D20
 * Estas rotaciones orientan el dado para mostrar cada número
 */
const FACE_ROTATIONS: Record<DiceValue, { x: number; y: number; z: number }> = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: Math.PI * 0.3, y: 0, z: 0 },
  3: { x: -Math.PI * 0.3, y: 0, z: 0 },
  4: { x: 0, y: Math.PI * 0.3, z: 0 },
  5: { x: 0, y: -Math.PI * 0.3, z: 0 },
  6: { x: Math.PI * 0.6, y: 0, z: 0 },
  7: { x: -Math.PI * 0.6, y: 0, z: 0 },
  8: { x: 0, y: Math.PI * 0.6, z: 0 },
  9: { x: 0, y: -Math.PI * 0.6, z: 0 },
  10: { x: Math.PI * 0.4, y: Math.PI * 0.4, z: 0 },
  11: { x: Math.PI * 0.4, y: -Math.PI * 0.4, z: 0 },
  12: { x: -Math.PI * 0.4, y: Math.PI * 0.4, z: 0 },
  13: { x: -Math.PI * 0.4, y: -Math.PI * 0.4, z: 0 },
  14: { x: 0, y: 0, z: Math.PI * 0.3 },
  15: { x: 0, y: 0, z: -Math.PI * 0.3 },
  16: { x: Math.PI * 0.3, y: 0, z: Math.PI * 0.3 },
  17: { x: Math.PI * 0.3, y: 0, z: -Math.PI * 0.3 },
  18: { x: -Math.PI * 0.3, y: 0, z: Math.PI * 0.3 },
  19: { x: -Math.PI * 0.3, y: 0, z: -Math.PI * 0.3 },
  20: { x: Math.PI, y: 0, z: 0 },
};

export function Dice3DRenderer({ 
  value, 
  isRolling, 
  size = 300 
}: Dice3DRendererProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Referencias de Three.js
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const diceRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  // Rotaciones objetivo e interpoladas
  const targetRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const autoRotationRef = useRef(0);

  /**
   * Actualiza la rotación objetivo cuando cambia el valor
   */
  useEffect(() => {
    if (!isRolling && diceRef.current) {
      targetRotationRef.current = FACE_ROTATIONS[value];
    }
  }, [value, isRolling]);

  /**
   * Inicializa la escena 3D
   */
  const onContextCreate = async (gl: WebGLRenderingContext) => {
    try {
      // Guardar referencia del contexto GL
      glRef.current = gl;

      // ========== RENDERER ==========
      const renderer = new Renderer({ gl });
      renderer.setSize(size, size);
      renderer.setClearColor(0x0a0a1f, 1); // Fondo oscuro
      rendererRef.current = renderer;

      // ========== ESCENA ==========
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // ========== CÁMARA ==========
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // ========== ILUMINACIÓN ==========
      // Luz ambiental suave
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      // Luz direccional principal (arriba-derecha)
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(5, 8, 5);
      scene.add(mainLight);

      // Luz de relleno (abajo-izquierda)
      const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
      fillLight.position.set(-5, -3, -5);
      scene.add(fillLight);

      // Luz de acento púrpura (desde atrás)
      const accentLight = new THREE.PointLight(0x9333ea, 0.8, 100);
      accentLight.position.set(0, 0, -10);
      scene.add(accentLight);

      // ========== CARGAR MODELO GLB ==========
      try {
        const asset = Asset.fromModule(
          require('../../../../assets/3D/d20_dice_w20_wurfel_3d_model_free.glb')
        );
        
        await asset.downloadAsync();

        // Importación dinámica del GLTFLoader
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        
        loader.load(
          asset.localUri || asset.uri,
          (gltf) => {
            const dice = gltf.scene;
            
            // ========== CONFIGURACIÓN DEL MODELO ==========
            dice.scale.set(2, 2, 2);
            dice.position.set(0, 0, 0);
            
            // Mejorar materiales
            dice.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                
                if (mesh.material) {
                  const material = mesh.material as THREE.MeshStandardMaterial;
                  
                  // Ajustar propiedades para mejor apariencia
                  material.roughness = 0.4;
                  material.metalness = 0.2;
                  material.envMapIntensity = 1;
                  
                  // Habilitar sombras
                  mesh.castShadow = true;
                  mesh.receiveShadow = true;
                }
              }
            });
            
            scene.add(dice);
            diceRef.current = dice;
            setIsLoading(false);
            
            // ========== LOOP DE ANIMACIÓN ==========
            const animate = () => {
              frameIdRef.current = requestAnimationFrame(animate);
              
              if (!diceRef.current) return;

              if (isRolling) {
                // ========== ROTACIÓN CAÓTICA MIENTRAS RUEDA ==========
                diceRef.current.rotation.x += 0.15;
                diceRef.current.rotation.y += 0.20;
                diceRef.current.rotation.z += 0.10;
                
                // Resetear auto-rotación
                autoRotationRef.current = 0;
              } else {
                // ========== INTERPOLACIÓN SUAVE HACIA EL VALOR ==========
                const lerpSpeed = 0.06;
                
                currentRotationRef.current.x += 
                  (targetRotationRef.current.x - currentRotationRef.current.x) * lerpSpeed;
                currentRotationRef.current.y += 
                  (targetRotationRef.current.y - currentRotationRef.current.y) * lerpSpeed;
                currentRotationRef.current.z += 
                  (targetRotationRef.current.z - currentRotationRef.current.z) * lerpSpeed;
                
                diceRef.current.rotation.x = currentRotationRef.current.x;
                diceRef.current.rotation.y = currentRotationRef.current.y + autoRotationRef.current;
                diceRef.current.rotation.z = currentRotationRef.current.z;
                
                // Auto-rotación lenta en Y
                autoRotationRef.current += 0.003;
              }
              
              // Renderizar
              renderer.render(scene, camera);
              
              // ========== FIX: Llamar a endFrameEXP ==========
              if (glRef.current?.endFrameEXP) {
                glRef.current.endFrameEXP();
              } else {
                // Flush alternativo para compatibilidad
                gl.flush();
              }
            };
            
            animate();
          },
          
          // Progreso de carga
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`Cargando modelo 3D: ${percent.toFixed(0)}%`);
          },
          
          // Error
          (error) => {
            console.error('Error cargando modelo GLB:', error);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error al preparar el asset:', error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error configurando escena 3D:', error);
      setIsLoading(false);
    }
  };

  /**
   * Limpieza al desmontar
   */
  useEffect(() => {
    return () => {
      // Cancelar animación
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Limpiar renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Limpiar geometrías y materiales
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            
            // Limpiar geometría
            if (mesh.geometry) {
              mesh.geometry.dispose();
            }
            
            // Limpiar materiales
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(material => material.dispose());
              } else {
                mesh.material.dispose();
              }
            }
          }
        });
      }
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Canvas WebGL */}
      <GLView
        style={{ width: size, height: size }}
        onContextCreate={onContextCreate}
      />
      
      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#9333ea" />
        </View>
      )}
      
      {/* Borde decorativo */}
      <View style={styles.border} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#0a0a1f',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1f',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
});