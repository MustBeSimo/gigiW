import React from 'react';
import InfiniteScroll, { InfiniteScrollItem } from './InfiniteScroll';

// List of supported image and video extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExtensions = ['.mp4', '.webm', '.mov'];

// Helper to determine file type
function isImage(filename: string) {
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}
function isVideo(filename: string) {
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// List of media files (manually listed for now; automate if needed)
const mediaFiles = [
  '1-strength.jpg', '1.jpg', '2.jpg', '3-dancing.jpg', '3.jpg', '4.jpg', '4running-.jpg', '5-boxing-.jpg', '5.jpg', '6-outdoor-1.jpg', '6-outdoor-2.jpg', '6-outdoor-3.jpg', '7-group_fitness_photo_ione_girl_with_blue_hair__nja52z2s8p9gdxdw9sob_1.jpg', '8-pilates_girl_with_blue_hair_6efvsudxco652w1zd617_0.jpg', 'a_fit_girl_with_intense_dark_blue_hair_running_wearing_blue_activewear__hd_photo_6k172f2uv58mht875qve_0.jpg', 'blue-hair-composition.jpg', 'blue-hair-portrait.jpg', 'empowered-woman.jpg', 'fitness-group.jpg', 'ghibli.jpg', 'walking-.jpg', '2 78146f2c-f743-4c21-bb37-e42b7c541b47-video_1.mp4', '16. 9 20250327_1146_Beachside Curiosity_simple_compose_01jqah1p3aeg998zfrn7cjx59a_1_1.mp4', 'Sequence 02_1.mp4', 'Sequence 03_1.mp4', 'YCJDT Comp 1_1.mp4', '_an_animated_text__mental_strength_matters__2pzjzcimzt70bf8mzq8n_1_1.mp4', 'digital-life_1.mp4', 'fitness-outdoor_1.mp4', 'lifestyle-video_1.mp4', 'movie_y4xdg5j135adn5t26csz_1_1.mp4', 'sunny-day_1.mp4', '10-HIIT-burpees_jumping_girl_with_blue_hair__side_view__activewear__lnwe1pzkkhxt1cd3yh5b_1.jpg', 'fitness-group.jpg'
];

const items: InfiniteScrollItem[] = mediaFiles.flatMap(filename => {
  const src = `/images/media/${filename}`;
  if (isImage(filename)) {
    return [{ content: <img src={src} alt={filename} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} loading="lazy" /> }];
  }
  if (isVideo(filename)) {
    return [{ content: <video src={src} autoPlay loop muted style={{ width: '100%', height: '100%', borderRadius: 12 }} /> }];
  }
  return [];
});

export default function SpotlightMediaScroll() {
  return (
    <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <InfiniteScroll
        items={items}
        width="100%"
        maxHeight="480px"
        itemMinHeight={240}
        negativeMargin="-10px"
        autoplay={true}
        autoplaySpeed={0.8}
        pauseOnHover={true}
        isTilted={true}
        tiltDirection="left"
      />
    </div>
  );
}
