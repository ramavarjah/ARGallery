import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import 'mind-ar/dist/mindar-face-three.prod.js'; // Imports the Face Tracking engine

const ARGallery = () => {
  const [activeProduct, setActiveProduct] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // We use a ref to hold the HTML div where the camera feed will be injected
  const containerRef = useRef(null);
  const mindarThreeRef = useRef(null);

  // 1. Listen for the Wix Product Data
  useEffect(() => {
    const handleWixMessage = (event) => {
      if (event.data && event.data.type === 'LOAD_NEW_GLASSES') {
        console.log("Received product from Wix:", event.data.data);
        setActiveProduct(event.data.data);
      }
    };
    window.addEventListener('message', handleWixMessage);
    return () => window.removeEventListener('message', handleWixMessage);
  }, []);

  // 2. Start the Face Tracking Engine
  const startTryOn = async () => {
    if (!activeProduct || !containerRef.current) return;
    setIsTracking(true);

    // Initialize MindAR Face Tracking attached to our container
    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: containerRef.current,
    });
    mindarThreeRef.current = mindarThree;

    const { renderer, scene, camera } = mindarThree;

    // Load the product image from Wix as a Three.js Texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(activeProduct.imageUrl);
    texture.anisotropy = 16;

    // Create the 3D Plane for the glasses using the Wix dimensions
    // We make the material transparent so the background of the PNG is invisible
    const geometry = new THREE.PlaneGeometry(
      activeProduct.dimensions.width, 
      activeProduct.dimensions.height
    );
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      side: THREE.DoubleSide
    });
    const glassesMesh = new THREE.Mesh(geometry, material);

    // Anchor point 168 is exactly on the bridge of the nose between the eyes!
    const anchor = mindarThree.addAnchor(168); 
    
    // Attach the glasses to the nose bridge anchor
    anchor.group.add(glassesMesh);

    // Start the camera and the tracking engine
    await mindarThree.start();

    // The animation loop to keep rendering the glasses as the face moves
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  // 3. Stop Tracking (If the user closes the try-on)
  const stopTryOn = () => {
    if (mindarThreeRef.current) {
      mindarThreeRef.current.stop();
      mindarThreeRef.current.renderer.setAnimationLoop(null);
    }
    setIsTracking(false);
  };

  // Cleanup when the component unmounts
  useEffect(() => {
    return () => {
      if (mindarThreeRef.current) {
        mindarThreeRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      
      {/* The container where the Camera Feed will appear */}
      <div 
        ref={containerRef} 
        className="absolute top-0 left-0 w-full h-full z-0"
      ></div>

      {/* UI Overlay */}
      <div className="absolute top-10 text-center z-10 pointer-events-none drop-shadow-md bg-black/40 px-6 py-2 rounded-xl">
        <h1 className="text-3xl font-bold mb-1">Lensopolis Try-On</h1>
        <p className="text-gray-300">
           {activeProduct ? `Ready to try: ${activeProduct.title}` : "Waiting for storefront..."}
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 z-10 flex gap-4">
        {!isTracking ? (
          <button
            onClick={startTryOn}
            disabled={!activeProduct} 
            className={`px-8 py-4 rounded-full font-bold shadow-xl transition text-lg ${
              activeProduct ? "bg-blue-600 hover:bg-blue-500 cursor-pointer" : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {activeProduct ? "Start Virtual Try-On" : "Loading..."}
          </button>
        ) : (
          <button
            onClick={stopTryOn}
            className="px-8 py-4 rounded-full font-bold shadow-xl transition text-lg bg-red-600 hover:bg-red-500 cursor-pointer"
          >
            Close Camera
          </button>
        )}
      </div>

    </div>
  );
};

export default ARGallery;