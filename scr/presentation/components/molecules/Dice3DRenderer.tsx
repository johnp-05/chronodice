import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Componente para renderizar el dado 3D usando Three.js
 */

interface Dice3DRendererProps {
  /**
   * Valor actual del dado (1-20)
   */
  value: number;
  
  /**
   * Si el dado está rodando
   */
  isRolling: boolean;
  
  /**
   * Tamaño del contenedor
   */
  size?: number;
}

export function Dice3DRenderer({ 
  value, 
  isRolling, 
  size = 300 
}: Dice3DRendererProps) {
  const [glReady, setGlReady] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const diceRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Rotaciones objetivo según el valor del dado
  const targetRotations = useRef({
    x: 0,
    y: 0,
    z: 0
  });

  // Rotaciones actuales (para interpolación)
  const currentRotations = useRef({
    x: 0,
    y: 0,
    z: 0
  });

  useEffect(() => {
    // Definir rotaciones para cada cara del D20
    const rotationMap: Record<number, { x: number; y: number; z: number }> = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0.6, y: 0, z: 0 },
      3: { x: -0.6, y: 0, z: 0 },
      4: { x: 0, y: 0.6, z: 0 },
      5: { x: 0, y: -0.6, z: 0 },
      6: { x: 1.2, y: 0, z: 0 },
      7: { x: -1.2, y: 0, z: 0 },
      8: { x: 0, y: 1.2, z: 0 },
      9: { x: 0, y: -1.2, z: 0 },
      10: { x: 0.6, y: 0.6, z: 0 },
      11: { x: 0.6, y: -0.6, z: 0 },
      12: { x: -0.6, y: 0.6, z: 0 },
      13: { x: -0.6, y: -0.6, z: 0 },
      14: { x: 0, y: 0, z: 0.6 },
      15: { x: 0, y: 0, z: -0.6 },
      16: { x: 0.6, y: 0, z: 0.6 },
      17: { x: 0.6, y: 0, z: -0.6 },
      18: { x: -0.6, y: 0, z: 0.6 },
      19: { x: -0.6, y: 0, z: -0.6 },
      20: { x: Math.PI, y: 0, z: 0 },
    };

    targetRotations.current = rotationMap[value] || { x: 0, y: 0, z: 0 };
  }, [value]);

  const onContextCreate = async (gl: WebGLRenderingContext) => {
    try {
      // Configurar renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(size, size);
      rendererRef.current = renderer;

      // Configurar escena
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      sceneRef.current = scene;

      // Configurar cámara
      const camera = new THREE.PerspectiveCamera(
        75,
        1, // aspect ratio
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Iluminación mejorada
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight1.position.set(5, 5, 5);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-5, -5, -5);
      scene.add(directionalLight2);

      const directionalLight3 = new THREE.DirectionalLight(0x9333ea, 0.3);
      directionalLight3.position.set(0, 10, 0);
      scene.add(directionalLight3);

      // Cargar modelo GLB
      try {
        const asset = Asset.fromModule(
          require('../../../assets/3D/d20_dice_w20_wurfel_3d_model_free.glb')
        );
        await asset.downloadAsync();

        const loader = new GLTFLoader();
        
        loader.load(
          asset.localUri || asset.uri,
          (gltf) => {
            const dice = gltf.scene;
            
            // Ajustar escala y posición
            dice.scale.set(2.5, 2.5, 2.5);
            dice.position.set(0, 0, 0);
            
            // Aplicar materiales mejorados
            dice.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                  const material = mesh.material as THREE.MeshStandardMaterial;
                  material.roughness = 0.3;
                  material.metalness = 0.1;
                }
              }
            });
            
            scene.add(dice);
            diceRef.current = dice;
            
            setGlReady(true);
            
            // Iniciar loop de renderizado
            const animate = () => {
              frameIdRef.current = requestAnimationFrame(animate);
              
              if (diceRef.current) {
                if (isRolling) {
                  // Rotación rápida y caótica mientras rueda
                  diceRef.current.rotation.x += 0.12;
                  diceRef.current.rotation.y += 0.18;
                  diceRef.current.rotation.z += 0.09;
                } else {
                  // Interpolación suave hacia la rotación objetivo
                  const lerpFactor = 0.08;
                  
                  currentRotations.current.x += 
                    (targetRotations.current.x - currentRotations.current.x) * lerpFactor;
                  currentRotations.current.y += 
                    (targetRotations.current.y - currentRotations.current.y) * lerpFactor;
                  currentRotations.current.z += 
                    (targetRotations.current.z - currentRotations.current.z) * lerpFactor;
                  
                  diceRef.current.rotation.x = currentRotations.current.x;
                  diceRef.current.rotation.y = currentRotations.current.y;
                  diceRef.current.rotation.z = currentRotations.current.z;
                  
                  // Rotación lenta automática cuando no está rodando
                  diceRef.current.rotation.y += 0.005;
                }
              }
              
              renderer.render(scene, camera);
              gl.endFrameEXP();
            };
            
            animate();
          },
          (progress) => {
            // Progreso de carga
            console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
          },
          (error) => {
            console.error('Error loading GLB model:', error);
          }
        );
      } catch (error) {
        console.error('Error loading asset:', error);
      }
    } catch (error) {
      console.error('Error setting up 3D scene:', error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GLView
        style={{ width: size, height: size }}
        onContextCreate={onContextCreate}
      />
      {!glReady && (
        <View style={styles.loading}>
          <View style={styles.loadingDot} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9333ea',
  },
});