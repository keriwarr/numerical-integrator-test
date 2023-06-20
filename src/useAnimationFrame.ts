import React, { useCallback } from "react";

export const useAnimationFrame = (
  callback: ({
    time,
    deltaTime,
    prevTime,
  }: {
    time: number;
    deltaTime: number;
    prevTime: number;
  }) => void
) => {
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback({ time, deltaTime, prevTime: previousTimeRef.current });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  React.useEffect(() => {
    console.log("mounting");
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);
};
