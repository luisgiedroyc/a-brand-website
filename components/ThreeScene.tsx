
import React, { Suspense, useRef, Component, ReactNode, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ProductID } from '../types';
import { Icosahedron, TorusKnot, OrbitControls, PerspectiveCamera, useGLTF, Center, Environment } from '@react-three/drei';
import { PRODUCTS } from '../constants';
import * as THREE from 'three';

class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const ModelLoader: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        (mesh.material as any).color = new THREE.Color(0x000000);
        (mesh.material as any).roughness = 0.05;
        (mesh.material as any).metalness = 0.9;
      }
    }
  });

  // @ts-ignore
  return <primitive object={scene} scale={3} />;
};

const SceneContent: React.FC<{ productId: ProductID }> = ({ productId }) => {
  const meshRef = useRef<THREE.Group>(null);
  const product = PRODUCTS[productId];
  const [canLoadModel, setCanLoadModel] = useState<boolean | null>(null);

  useEffect(() => {
    if (!product.modelPath) {
      setCanLoadModel(false);
      return;
    }

    fetch(product.modelPath, { method: 'HEAD' })
      .then(res => setCanLoadModel(res.ok))
      .catch(() => setCanLoadModel(false));
  }, [product.modelPath]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const DefaultPrimitive = () => (
    productId === 'orb' ? (
      <Icosahedron args={[2.2, 3]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#000" wireframe opacity={0.1} transparent />
      </Icosahedron>
    ) : (
      <TorusKnot args={[1.5, 0.4, 128, 32]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#000" wireframe opacity={0.1} transparent />
      </TorusKnot>
    )
  );

  return (
    // @ts-ignore
    <group ref={meshRef}>
      <Center>
        {canLoadModel === true ? (
          <ModelErrorBoundary fallback={<DefaultPrimitive />}>
            <Suspense fallback={<DefaultPrimitive />}>
              <ModelLoader url={product.modelPath!} />
            </Suspense>
          </ModelErrorBoundary>
        ) : (
          <DefaultPrimitive />
        )}
      </Center>
      {/* @ts-ignore */}
      <pointLight position={[0, -3, 2]} intensity={5} color="#ffffff" />
      {/* @ts-ignore */}
      <pointLight position={[0, 3, -2]} intensity={2} color="#44ccff" />
    </group>
  );
};

const ThreeScene: React.FC<{ productId: ProductID }> = ({ productId }) => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={35} />
        {/* @ts-ignore */}
        <ambientLight intensity={0.5} />
        {/* @ts-ignore */}
        <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={2} castShadow />
        <Environment preset="city" />
        <SceneContent productId={productId} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          makeDefault 
        />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
