/**
 * React hook for real-time collision detection and boundary management
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { MotionValue, animate } from 'framer-motion';
import {
  BoundingBox,
  CollisionResult,
  BoundaryResult,
  checkCollisions,
  checkBoundaries,
  findSafePosition,
  getBounceAnimationConfig
} from '@/utils/collisionDetection';

interface UseCollisionDetectionProps {
  id: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: number;
  height: number;
  safePosition: { x: number; y: number };
  viewport: { width: number; height: number };
  maxOverlapPercentage?: number;
  maxBoundaryOverflowPercentage?: number;
  onCollision?: (result: CollisionResult) => void;
  onBoundaryViolation?: (result: BoundaryResult) => void;
}

interface CollisionState {
  hasCollision: boolean;
  isOutOfBounds: boolean;
  severity: 'none' | 'minor' | 'major' | 'critical';
}

// Global registry to track all floating elements
const elementRegistry = new Map<string, BoundingBox>();

export function useCollisionDetection({
  id,
  x,
  y,
  width,
  height,
  safePosition,
  viewport,
  maxOverlapPercentage = 20,
  maxBoundaryOverflowPercentage = 20,
  onCollision,
  onBoundaryViolation
}: UseCollisionDetectionProps) {
  const [collisionState, setCollisionState] = useState<CollisionState>({
    hasCollision: false,
    isOutOfBounds: false,
    severity: 'none'
  });

  const animationRef = useRef<any>(null);
  const lastCheckTime = useRef<number>(0);
  const isReturningToPosition = useRef<boolean>(false);

  // Register/update element position in global registry
  const updateElementPosition = useCallback(() => {
    const currentX = x.get();
    const currentY = y.get();

    elementRegistry.set(id, {
      id,
      x: currentX,
      y: currentY,
      width,
      height
    });
  }, [id, x, y, width, height]);

  // Get all other elements for collision checking
  const getOtherElements = useCallback((): BoundingBox[] => {
    const allElements = Array.from(elementRegistry.values());
    return allElements.filter(element => element.id !== id);
  }, [id]);

  // Perform collision and boundary checks
  const performChecks = useCallback(() => {
    const now = Date.now();
    // Throttle checks to avoid performance issues
    if (now - lastCheckTime.current < 16) return; // ~60fps
    lastCheckTime.current = now;

    updateElementPosition();

    const currentBox = elementRegistry.get(id);
    if (!currentBox || viewport.width === 0 || viewport.height === 0) return;

    const otherElements = getOtherElements();

    // Check collisions
    const collisionResult = checkCollisions(currentBox, otherElements, maxOverlapPercentage);

    // Check boundaries
    const boundaryResult = checkBoundaries(
      currentBox,
      viewport.width,
      viewport.height,
      maxBoundaryOverflowPercentage
    );

    // Determine severity
    let severity: CollisionState['severity'] = 'none';
    if (collisionResult.hasCollision || !boundaryResult.isWithinBounds) {
      const maxProblem = Math.max(
        collisionResult.overlapPercentage,
        boundaryResult.overflowPercentage
      );

      if (maxProblem > 50) severity = 'critical';
      else if (maxProblem > 35) severity = 'major';
      else if (maxProblem > maxOverlapPercentage) severity = 'minor';
    }

    // Update state
    setCollisionState({
      hasCollision: collisionResult.hasCollision,
      isOutOfBounds: !boundaryResult.isWithinBounds,
      severity
    });

    // Trigger callbacks
    if (collisionResult.hasCollision && onCollision) {
      onCollision(collisionResult);
    }
    if (!boundaryResult.isWithinBounds && onBoundaryViolation) {
      onBoundaryViolation(boundaryResult);
    }

    return {
      collision: collisionResult,
      boundary: boundaryResult,
      severity
    };
  }, [
    id,
    viewport,
    maxOverlapPercentage,
    maxBoundaryOverflowPercentage,
    updateElementPosition,
    getOtherElements,
    onCollision,
    onBoundaryViolation
  ]);

  // Return element to safe position with smooth animation
  const returnToSafePosition = useCallback((
    forceReturn: boolean = false,
    customDelay: number = 0
  ) => {
    if (isReturningToPosition.current && !forceReturn) return;

    const checkResult = performChecks();
    if (!checkResult || (checkResult.severity === 'none' && !forceReturn)) return;

    isReturningToPosition.current = true;

    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const animationConfig = getBounceAnimationConfig(
      checkResult.severity === 'critical' || checkResult.severity === 'major' ? 'strong' : 'gentle'
    );

    // Calculate delay based on severity
    const delay = customDelay || (checkResult.severity === 'critical' ? 0 : 400);

    setTimeout(() => {
      // Use suggested position from collision detection if available
      let targetX = safePosition.x;
      let targetY = safePosition.y;

      if (checkResult.collision.suggestedPosition) {
        targetX = checkResult.collision.suggestedPosition.x;
        targetY = checkResult.collision.suggestedPosition.y;
      } else if (checkResult.boundary.suggestedPosition) {
        targetX = checkResult.boundary.suggestedPosition.x;
        targetY = checkResult.boundary.suggestedPosition.y;
      }

      // Animate to safe position
      const xAnimation = animate(x, targetX, animationConfig);
      const yAnimation = animate(y, targetY, animationConfig);

      animationRef.current = {
        stop: () => {
          xAnimation.stop();
          yAnimation.stop();
        }
      };

      // Track when animation completes
      Promise.all([xAnimation, yAnimation]).finally(() => {
        isReturningToPosition.current = false;
        animationRef.current = null;
      });
    }, delay);
  }, [performChecks, safePosition, x, y]);

  // Monitor position changes and check for violations
  useEffect(() => {
    const unsubscribeX = x.on('change', performChecks);
    const unsubscribeY = y.on('change', performChecks);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, performChecks]);

  // Clean up registry on unmount
  useEffect(() => {
    return () => {
      elementRegistry.delete(id);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [id]);

  // Handle drag end with collision/boundary checks
  const handleDragEnd = useCallback((
    velocity: { x: number; y: number },
    offset: { x: number; y: number }
  ) => {
    const checkResult = performChecks();
    if (!checkResult) return;

    // Determine if we need to return to safe position
    const shouldReturn =
      checkResult.severity === 'critical' ||
      checkResult.severity === 'major' ||
      (checkResult.severity === 'minor' && Math.abs(velocity.x) < 500 && Math.abs(velocity.y) < 500);

    if (shouldReturn) {
      const delay = Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500 ? 800 : 400;
      returnToSafePosition(false, delay);
    }
  }, [performChecks, returnToSafePosition]);

  // Force return to position (for manual control)
  const forceReturnToPosition = useCallback(() => {
    returnToSafePosition(true, 0);
  }, [returnToSafePosition]);

  return {
    collisionState,
    handleDragEnd,
    forceReturnToPosition,
    performChecks,
    updateElementPosition
  };
}

// Utility to clear all registered elements (useful for cleanup)
export function clearElementRegistry() {
  elementRegistry.clear();
}