"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Image as DreiImage } from '@react-three/drei';
import { TextureLoader, Texture } from 'three';

// List of media files (images only for now)
const mediaFiles = [
  '1-strength.jpg', '1.jpg', '2.jpg', '3-dancing.jpg', '3.jpg', '4.jpg', '4running-.jpg',
  '5-boxing-.jpg', '5.jpg', '6-outdoor-1.jpg', '6-outdoor-2.jpg', '6-outdoor-3.jpg',
  '7-group_fitness_photo_ione_girl_with_blue_hair__nja52z2s8p9gdxdw9sob_1.jpg',
  '8-pilates_girl_with_blue_hair_6efvsudxco652w1zd617_0.jpg', 'a_fit_girl_with_intense_dark_blue_hair_running_wearing_blue_activewear__hd_photo_6k172f2uv58mht875qve_0.jpg',
  'blue-hair-composition.jpg', 'blue-hair-portrait.jpg', 'empowered-woman.jpg', 'fitness-group.jpg',
  'optimized-1-strength.jpg', 'optimized-1.jpg', 'optimized-2.jpg', 'optimized-3-dancing.jpg',
  'optimized-3.jpg', 'optimized-4.jpg', 'optimized-4running-.jpg', 'optimized-5-boxing-.jpg',
  'optimized-5.jpg', 'optimized-6-outdoor-1.jpg', 'optimized-6-outdoor-2.jpg', 'optimized-6-outdoor-3.jpg',
  'optimized-7-group_fitness_photo_ione_girl_with_blue_hair__nja52z2s8p9gdxdw9sob_1.jpg',
  'optimized-8-pilates_girl_with_blue_hair_6efvsudxco652w1zd617_0.jpg', 'optimized-a_fit_girl_with_intense_dark_blue_hair_running_wearing_blue_activewear__hd_photo_6k172f2uv58mht875qve_0.jpg',
  'optimized-blue-hair-composition.jpg', 'optimized-blue-hair-portrait.jpg', 'optimized-empowered-woman.jpg',
].filter(f => /\.(jpe?g|png)$/i.test(f));

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

function FlyingImage({ url }: { url: string }) {
  const ref = useRef<any>();
  // load texture to get original aspect ratio
  // @ts-ignore: loader return type
  const texture = useLoader(TextureLoader, `/images/media/${url}`) as Texture;
  const img = texture.image as HTMLImageElement;
  const aspect = img.naturalWidth / img.naturalHeight;
  // Each image gets its own random initial state
  const data = useMemo(() => ({
    x: getRandom(-8, 8),
    y: getRandom(-5, 5),
    z: getRandom(-40, -10),
    speed: getRandom(0.02, 0.15),
    rotation: getRandom(0, Math.PI * 2),
    rotSpeed: getRandom(-0.01, 0.01),
    flip: Math.random() > 0.5 ? -1 : 1,
    scaleFactor: getRandom(0.3, 0.7),
  }), []);

  useFrame(() => {
    if (!ref.current) return;
    data.z += data.speed;
    data.rotation += data.rotSpeed;
    // Reset if passed camera
    if (data.z > 5) {
      data.z = getRandom(-40, -10);
      data.x = getRandom(-8, 8);
      data.y = getRandom(-5, 5);
      data.speed = getRandom(0.02, 0.15);
      data.rotation = getRandom(0, Math.PI * 2);
      data.rotSpeed = getRandom(-0.01, 0.01);
      data.flip = Math.random() > 0.5 ? -1 : 1;
      data.scaleFactor = getRandom(0.3, 0.7);
    }
    ref.current.position.set(data.x, data.y, data.z);
    ref.current.rotation.set(0, 0, data.rotation);
    // preserve aspect ratio and apply scaleFactor; flip only horizontally
    // scaleFactor always multiplies both axes by the same amount, so aspect ratio is preserved
    // Correct aspect ratio scaling: always use the same scaleFactor for x and y, then apply aspect and flip to x only
    const baseScale = data.scaleFactor;
    ref.current.scale.set(baseScale * aspect * data.flip, baseScale, 1);

    // Calculate how close to the camera (z=5 is camera)
    let opacity = 1;
    let blurAmount = 0;
    if (data.z > -2) {
      // Fade out and blur as it gets close
      const t = Math.min(1, (data.z + 2) / 7); // from z=-2 to z=5
      opacity = 1 - t; // fades out to 0
      blurAmount = t * 8; // up to 8px blur near camera
    }
    if (ref.current.material) {
      ref.current.material.opacity = opacity;
      ref.current.material.transparent = true;
      // If material supports filter, set blur (not always available)
      if (ref.current.material.map && ref.current.material.map.image) {
        try {
          ref.current.material.map.image.style && (ref.current.material.map.image.style.filter = `blur(${blurAmount}px)`);
        } catch {}
      }
    }

  });

  return (
    <DreiImage
      ref={ref}
      url={`/images/media/${url}`}
      transparent
      toneMapped={false}
    />
  );
}

export default function MediaFlyThroughBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 70 }}>
        {mediaFiles.map((url, i) => (
          <FlyingImage key={i} url={url} />
        ))}
        <ambientLight intensity={1.5} />
      </Canvas>
    </div>
  );
}
