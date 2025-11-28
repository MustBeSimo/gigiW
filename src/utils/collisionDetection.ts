/**
 * Collision Detection and Boundary Management System
 * Ensures floating elements maintain 20% overlap threshold and stay within canvas bounds
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export interface CollisionResult {
  hasCollision: boolean;
  overlapPercentage: number;
  suggestedPosition: { x: number; y: number } | null;
}

export interface BoundaryResult {
  isWithinBounds: boolean;
  overflowPercentage: number;
  suggestedPosition: { x: number; y: number } | null;
}

/**
 * Calculate overlap percentage between two bounding boxes
 */
export function calculateOverlap(box1: BoundingBox, box2: BoundingBox): number {
  const x_overlap = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
  const y_overlap = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));

  const overlap_area = x_overlap * y_overlap;
  const box1_area = box1.width * box1.height;
  const box2_area = box2.width * box2.height;

  // Calculate overlap as percentage of smaller box
  const smaller_area = Math.min(box1_area, box2_area);
  return smaller_area > 0 ? (overlap_area / smaller_area) * 100 : 0;
}

/**
 * Check collision between element and all other elements
 */
export function checkCollisions(
  targetBox: BoundingBox,
  allBoxes: BoundingBox[],
  maxOverlapPercentage: number = 20
): CollisionResult {
  let maxOverlap = 0;
  let hasCollision = false;

  for (const box of allBoxes) {
    if (box.id === targetBox.id) continue;

    const overlap = calculateOverlap(targetBox, box);
    if (overlap > maxOverlapPercentage) {
      hasCollision = true;
      maxOverlap = Math.max(maxOverlap, overlap);
    }
  }

  return {
    hasCollision,
    overlapPercentage: maxOverlap,
    suggestedPosition: hasCollision ? findSafePosition(targetBox, allBoxes, maxOverlapPercentage) : null
  };
}

/**
 * Check if element exceeds canvas boundary limits
 */
export function checkBoundaries(
  box: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  maxOverflowPercentage: number = 20
): BoundaryResult {
  const maxOverflowX = (canvasWidth * maxOverflowPercentage) / 100;
  const maxOverflowY = (canvasHeight * maxOverflowPercentage) / 100;

  const leftOverflow = Math.max(0, -box.x);
  const rightOverflow = Math.max(0, (box.x + box.width) - canvasWidth);
  const topOverflow = Math.max(0, -box.y);
  const bottomOverflow = Math.max(0, (box.y + box.height) - canvasHeight);

  const maxOverflow = Math.max(leftOverflow, rightOverflow, topOverflow, bottomOverflow);
  const overflowPercentage = (maxOverflow / Math.min(canvasWidth, canvasHeight)) * 100;

  const isWithinBounds = overflowPercentage <= maxOverflowPercentage;

  return {
    isWithinBounds,
    overflowPercentage,
    suggestedPosition: !isWithinBounds ? {
      x: Math.max(maxOverflowX, Math.min(canvasWidth - box.width - maxOverflowX, box.x)),
      y: Math.max(maxOverflowY, Math.min(canvasHeight - box.height - maxOverflowY, box.y))
    } : null
  };
}

/**
 * Find a safe position that avoids collisions and boundary violations
 */
export function findSafePosition(
  targetBox: BoundingBox,
  allBoxes: BoundingBox[],
  maxOverlapPercentage: number = 20,
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): { x: number; y: number } {
  const attempts = 50;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  for (let i = 0; i < attempts; i++) {
    // Try positions in expanding spiral from center
    const angle = (i * 137.5) * (Math.PI / 180); // Golden angle
    const radius = Math.sqrt(i) * 30;

    const testX = centerX + Math.cos(angle) * radius - targetBox.width / 2;
    const testY = centerY + Math.sin(angle) * radius - targetBox.height / 2;

    const testBox: BoundingBox = {
      ...targetBox,
      x: testX,
      y: testY
    };

    // Check if this position is safe
    const collision = checkCollisions(testBox, allBoxes, maxOverlapPercentage);
    const boundary = checkBoundaries(testBox, canvasWidth, canvasHeight, 20);

    if (!collision.hasCollision && boundary.isWithinBounds) {
      return { x: testX, y: testY };
    }
  }

  // Fallback to center position
  return {
    x: centerX - targetBox.width / 2,
    y: centerY - targetBox.height / 2
  };
}

/**
 * Generate spring animation config for smooth repositioning
 */
export function getBounceAnimationConfig(severity: 'gentle' | 'strong' = 'gentle') {
  return severity === 'gentle' ? {
    type: "spring" as const,
    stiffness: 300,
    damping: 35,
    restDelta: 0.01
  } : {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    restDelta: 0.01
  };
}

/**
 * Calculate minimum safe distance between elements
 */
export function getMinimumSpacing(
  element1Size: { width: number; height: number },
  element2Size: { width: number; height: number },
  maxOverlapPercentage: number = 20
): number {
  const avgWidth = (element1Size.width + element2Size.width) / 2;
  const avgHeight = (element1Size.height + element2Size.height) / 2;
  const avgSize = Math.sqrt(avgWidth * avgWidth + avgHeight * avgHeight);

  // Calculate minimum distance to keep overlap under threshold
  const overlapBuffer = (avgSize * maxOverlapPercentage) / 100;
  return avgSize - overlapBuffer + 20; // Add 20px buffer
}