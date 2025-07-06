"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Texture } from 'three';
import * as THREE from 'three';

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
  const mounted = useRef(true);
  // Type workaround: TextureLoader is not assignable to LoaderProto in @react-three/fiber v8 + three 0.152
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const texture = useLoader(TextureLoader as unknown as any, `/images/media/${url}`, (loader) => {
    // Enable texture compression and mipmaps for better performance
    const tex = loader.load(`/images/media/${url}`);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }) as Texture;
  const [aspect, setAspect] = React.useState<number | null>(null);

  // Ensure texture fills mesh, no cropping
  React.useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
    }
  }, [texture]);

  React.useEffect(() => {
    const img = texture.image as HTMLImageElement;
    function updateAspect() {
      if (mounted.current && img && img.naturalWidth && img.naturalHeight) {
        const asp = img.naturalWidth / img.naturalHeight;
        setAspect(asp);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[FlyingImage] url: ${url}, naturalWidth: ${img.naturalWidth}, naturalHeight: ${img.naturalHeight}, aspect: ${asp}`);
        }
      }
    }
    if (img && img.complete) {
      updateAspect();
    } else if (img) {
      img.onload = updateAspect;
    }

    return () => {
      mounted.current = false;
    };
  }, [texture, url]);

  const data = useMemo(() => ({
    x: Math.random() * 8 - 4,
    y: Math.random() * 5 - 2.5,
    z: Math.random() * 20 - 10,
    rotation: Math.random() * Math.PI * 2,
    speed: 0.03 + Math.random() * 0.01,
    rotSpeed: 0.005 + Math.random() * 0.002,
    scaleFactor: 2.0 + Math.random() * 0.7,
    flip: Math.random() > 0.5 ? 1 : -1,
  }), []);

  useFrame(() => {
    if (!ref.current || !aspect || !mounted.current) return;
    data.z += data.speed;
    data.rotation += data.rotSpeed;
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
    ref.current.scale.set(data.scaleFactor * data.flip * aspect, data.scaleFactor, 1);
    let opacity = 1;
    if (data.z > -2) {
      const t = Math.min(1, (data.z + 2) / 7);
      opacity = 1 - t;
    }
    if (ref.current.material) {
      ref.current.material.opacity = opacity;
      ref.current.material.transparent = true;
    }
  });

  if (!aspect || !isFinite(aspect) || aspect <= 0) return null;

  return (
    <mesh ref={ref} key={aspect}>
      <planeGeometry args={[1.4, 1.4]} key={aspect} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        toneMapped={false} 
        depthWrite={false} 
        side={THREE.DoubleSide}
        dispose={() => {}} // Empty dispose function instead of null
      />
    </mesh>
  );
}


