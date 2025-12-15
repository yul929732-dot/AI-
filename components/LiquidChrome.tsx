import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface LiquidChromeProps {
  isActive: boolean;
}

const GradientBackground = ({ isActive }: { isActive: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    // Create texture only once using useMemo
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createLinearGradient(0, 0, 512, 512);
            gradient.addColorStop(0, '#4f46e5'); // Indigo
            gradient.addColorStop(0.5, '#a855f7'); // Purple
            gradient.addColorStop(1, '#ec4899'); // Pink
            context.fillStyle = gradient;
            context.fillRect(0, 0, 512, 512);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.z += isActive ? 0.02 : 0.002;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]} scale={6}>
            <planeGeometry />
            <meshBasicMaterial map={texture} />
        </mesh>
    );
};

const LiquidBlob = ({ isActive }: { isActive: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating/wobble rotation
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* The Liquid Glass Object */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} scale={[3.5, 0.8, 0.8]} position={[0, 0, 0]}>
          {/* A capsule-like geometry for the strip */}
          <torusGeometry args={[1.8, 0.6, 32, 100]} /> 
          
          {/* Advanced Glass Material */}
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={isActive ? 2.5 : 1.5}
            roughness={0}
            transmission={1}
            ior={1.5}
            chromaticAberration={isActive ? 0.2 : 0.04}
            anisotropy={0.5}
            distortion={isActive ? 0.8 : 0.4}
            distortionScale={0.5}
            temporalDistortion={0.2}
            color={"#ffffff"}
            background={new THREE.Color('#ffffff')} 
          />
        </mesh>
      </Float>
      
      {/* Background Gradient */}
      <GradientBackground isActive={isActive} />

      {/* Lighting Environment */}
      <Environment preset="city" />
    </group>
  );
};

export const LiquidChrome: React.FC<LiquidChromeProps> = ({ isActive }) => {
  return (
    <div className="w-full h-full absolute inset-0" style={{ zIndex: 0 }}>
      {/* frameloop="demand" helps performance if nothing moves, but here we want continuous animation */}
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <LiquidBlob isActive={isActive} />
      </Canvas>
    </div>
  );
};