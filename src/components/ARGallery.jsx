import React, { Suspense, useState, useRef, useEffect } from 'react'; 
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// 1. Trimmed back to 3 photos, keeping the High-Res w_1200 URLs
const galleryData = [
  {
    url: "https://static.wixstatic.com/media/8d95e1_3c27e0038d4c4ebe9378129f2f944905~mv2.png/v1/fit/w_1200,h_1200,q_90/file.png",
    title: "Urban Geometry"
  },
  {
    url: "https://static.wixstatic.com/media/8d95e1_94484720a77c43a897f12b6204fa5af1~mv2.png/v1/fit/w_1200,h_1200,q_90/file.png",
    title: "Neon Nights"
  },
  {
    url: "https://static.wixstatic.com/media/8d95e1_d8e40c00f58d47ccb40627457cdc1c96~mv2.png/v1/fit/w_1200,h_1200,q_90/file.png",
    title: "Architectural Shift"
  }
];

// 2. Restored the Interactive Photo Component
const FramedInteractivePhoto = ({ position, rotation, url, title }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.anisotropy = 16; // Keeps the high-res texture crisp at angles

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const groupRef = useRef();

  // Restored the gentle breathing animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const yOffset = Math.sin(time * 2 + position[0]) * 0.05;
    groupRef.current.position.y = position[1] + yOffset;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={isClicked ? 1.2 : 1} // Click to enlarge is back!
      onClick={() => setIsClicked(!isClicked)}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* Kept the larger 1.6x1.6 frames */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[1.6, 1.6, 0.05]} />
        <meshStandardMaterial color={isHovered ? "#555" : "#222"} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      <Text
        position={[0, -0.9, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {title}
      </Text>
    </group>
  );
};

const store = createXRStore();

const ARGallery = () => {
  // NEW: State to track if the phone actually supports AR
  const [arSupported, setArSupported] = useState(true); 

  // NEW: Check for WebXR support as soon as the page loads
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setArSupported(supported);
      });
    } else {
      setArSupported(false);
    }
  }, []);
  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative">
      {/* <button
        onClick={() => store.enterAR()}
        className="absolute bottom-10 z-10 px-6 py-3 bg-blue-600 rounded-full font-bold shadow-lg hover:bg-blue-500 transition cursor-pointer"
      >
        Enter AR
      </button> */}
      {/* UPDATED BUTTON: Changes color and text if AR is disabled */}
      <button
        onClick={() => arSupported && store.enterAR()}
        disabled={!arSupported}
        className={`absolute bottom-10 z-10 px-6 py-3 rounded-full font-bold shadow-lg transition ${
          arSupported 
            ? "bg-blue-600 hover:bg-blue-500 cursor-pointer" 
            : "bg-gray-600 cursor-not-allowed opacity-50"
        }`}
      >
        {arSupported ? "Enter AR" : "AR Not Supported Here"}
      </button>

      <Canvas shadows>
        <XR store={store}>
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[0, 10, 5]}
            intensity={2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <Suspense fallback={null}>
            {/* 3. Curved Museum Layout - Spaced out nicely to fit the big frames */}
            <FramedInteractivePhoto
              url={galleryData[0].url}
              title={galleryData[0].title}
              position={[-2.2, 1.5, -2.5]} 
              rotation={[0, Math.PI / 8, 0]}
            />

            <FramedInteractivePhoto
              url={galleryData[1].url}
              title={galleryData[1].title}
              position={[0, 1.5, -3]} 
              rotation={[0, 0, 0]}
            />

            <FramedInteractivePhoto
              url={galleryData[2].url}
              title={galleryData[2].title}
              position={[2.2, 1.5, -2.5]} 
              rotation={[0, -Math.PI / 8, 0]}
            />

            {/* Kept the invisible shadow-catching floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <shadowMaterial opacity={0.4} />
            </mesh>
          </Suspense>
        </XR>
      </Canvas>

      <div className="absolute top-10 text-center pointer-events-none">
        <h1 className="text-3xl font-bold mb-2">Lensopolis AR</h1>
        {/* Helper text based on support */}
        <p className="text-gray-400">
          {arSupported ? "Curved gallery layout." : "Please use Chrome on an Android device."}
        </p>
        {/* <p className="text-gray-400">Curved gallery layout.</p> */}
      </div>
    </div>
  );
};

export default ARGallery;