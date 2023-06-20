import React, { useCallback, useEffect, useMemo } from "react";
import "./App.css";
import { Stage, Layer, Circle, Line } from "react-konva";
import { Vec2D, makeVec2D } from "./vector";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useAnimationFrame } from "./useAnimationFrame";
import { EWMA } from "./EWMA";
import { Simulation, UpdateAlgorithm } from "./Simulation";

export const planetGravity = 1000;
export const planetRadius = 0.001;

const PANEL_WIDTH = 300;

const UNIT_DISTANCE_IN_PX = 100;

function App() {
  const horizontalMidpoint = (window.innerWidth - PANEL_WIDTH) / 2;
  const verticalMidpoint = window.innerHeight / 2;
  const getAdjustedPosition = (vec: Vec2D) =>
    makeVec2D(
      vec.x * UNIT_DISTANCE_IN_PX + horizontalMidpoint,
      // We need to flip the y-axis because the y-axis is flipped in the canvas
      -vec.y * UNIT_DISTANCE_IN_PX + verticalMidpoint
    );

  const planetPos = makeVec2D(0, 0);
  const planetPosAdjusted = getAdjustedPosition(planetPos);

  const initialRocketPos = () => makeVec2D(-0.3, 0);
  const initialRocketVel = () => makeVec2D(0.0, 0.079);

  const [logStepFactor, setLogStepFactor] = React.useState(-4); // base 2
  const stepFactor = useMemo(() => 2 ** logStepFactor, [logStepFactor]);

  const eulerSimulation = React.useRef(
    new Simulation(
      UpdateAlgorithm.Euler,
      planetPos,
      initialRocketPos(),
      initialRocketVel(),
      stepFactor
    )
  );
  const implicitEulerSimulation = React.useRef(
    new Simulation(
      UpdateAlgorithm.ImplicitEuler,
      planetPos,
      initialRocketPos(),
      initialRocketVel(),
      stepFactor
    )
  );
  const verletSimulation = React.useRef(
    new Simulation(
      UpdateAlgorithm.Verlet,
      planetPos,
      initialRocketPos(),
      initialRocketVel(),
      stepFactor
    )
  );

  const [isRunning, setIsRunning] = React.useState(true);

  const [eulerRocketPos, setEulerRocketPos] = React.useState(
    initialRocketPos()
  );
  const [implicitEulerRocketPos, setImplicitEulerRocketPos] = React.useState(
    initialRocketPos()
  );
  const [verletRocketPos, setVerletRocketPos] = React.useState(
    initialRocketPos()
  );
  // const [renderedRocketVel, setRenderedRocketVel] =
  //   React.useState(initialRocketVel);
  const eulerRocketPosAdjusted = getAdjustedPosition(eulerRocketPos);
  const implicitEulerRocketPosAdjusted = getAdjustedPosition(
    implicitEulerRocketPos
  );
  const verletRocketPosAdjusted = getAdjustedPosition(verletRocketPos);

  const [logTicksPerRealSecond, setLogTicksPerRealSecond] = React.useState(6); // base 2
  const ticksPerRealSecond = 2 ** logTicksPerRealSecond * 15;

  useEffect(() => {
    eulerSimulation.current.stepFactor = stepFactor;
    implicitEulerSimulation.current.stepFactor = stepFactor;
    verletSimulation.current.stepFactor = stepFactor;
  }, [stepFactor]);

  const [framesPerSecond, setFramesPerSecond] = React.useState(0);
  // const [advanceTime, setAdvanceTime] = React.useState(0);
  const [slowConvergingAdvanceTime, setSlowConvergingAdvanceTime] =
    React.useState(0);
  const [actualTicksPerRealSecond, setActualTicksPerRealSecond] =
    React.useState(0);
  const [msPerTick, setMsPerTick] = React.useState(0);

  const animate = useCallback(
    ({
      time,
      deltaTime,
      prevTime,
    }: {
      time: number;
      deltaTime: number;
      prevTime: number;
    }) => {
      if (!isRunning) return;

      const prevTargetTick = Math.floor((prevTime * ticksPerRealSecond) / 1000);
      const targetTick = Math.floor((time * ticksPerRealSecond) / 1000);
      let ticksToAdvance = targetTick - prevTargetTick;

      // if (advanceTime > 5) {
      //   // idk how to make this work in general, but it works for my computer
      //   ticksToAdvance = Math.floor(ticksToAdvance * (5 / advanceTime));
      // }

      const startAdvanceTime = performance.now();
      eulerSimulation.current.advance(ticksToAdvance);
      implicitEulerSimulation.current.advance(ticksToAdvance);
      verletSimulation.current.advance(ticksToAdvance);
      const endAdvanceTime = performance.now();

      setFramesPerSecond((prev) => EWMA(0.1, prev, 1000 / deltaTime));
      // setAdvanceTime((prev) =>
      //   EWMA(0.5, prev, endAdvanceTime - startAdvanceTime)
      // );
      setSlowConvergingAdvanceTime((prev) =>
        EWMA(0.99, prev, endAdvanceTime - startAdvanceTime)
      );
      setActualTicksPerRealSecond((prev) =>
        EWMA(0.1, prev, ticksToAdvance / (deltaTime / 1000))
      );
      setMsPerTick((prev) =>
        EWMA(
          0.99,
          prev,
          ticksToAdvance === 0
            ? 0
            : (endAdvanceTime - startAdvanceTime) / ticksToAdvance
        )
      );

      setEulerRocketPos(eulerSimulation.current.rocketPos);
      setImplicitEulerRocketPos(implicitEulerSimulation.current.rocketPos);
      setVerletRocketPos(verletSimulation.current.rocketPos);
    },
    [isRunning, ticksPerRealSecond]
  );
  useAnimationFrame(animate);

  const MIN_LOG_TICKS_PER_REAL_SECOND = 0;
  const MAX_LOG_TICKS_PER_REAL_SECOND = 20;
  const MIN_LOG_STEP_FACTOR = -10;
  const MAX_LOG_STEP_FACTOR = 10;
  return (
    <div className="App">
      <div
        className="sidebar"
        style={{
          width: PANEL_WIDTH,
        }}
      >
        <h3>Legend</h3>
        <table>
          <tbody>
            <tr>
              <td>Euler method</td>
              <td>
                {/* The euler rocket is a read circle */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "red",
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Symplectic Euler method</td>
              <td>
                {/* The euler rocket is a read circle */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "green",
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Verlet method</td>
              <td>
                {/* The euler rocket is a read circle */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "yellow",
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Controls</h3>
        <div>
          <button
            onClick={() => {
              eulerSimulation.current.reset();
              implicitEulerSimulation.current.reset();
              verletSimulation.current.reset();
            }}
            style={{
              marginRight: 10,
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              marginRight: 10,
            }}
          >
            {isRunning ? "Pause" : "Resume"}
          </button>
          <p>
            Target ticks per second:
            <br />
            <span
              style={{
                fontFamily: "monospace",
              }}
            >
              {ticksPerRealSecond.toLocaleString()}
            </span>
          </p>
          <Slider
            min={MIN_LOG_TICKS_PER_REAL_SECOND}
            max={MAX_LOG_TICKS_PER_REAL_SECOND}
            value={logTicksPerRealSecond}
            onChange={(val) => {
              setLogTicksPerRealSecond(val as number);
            }}
          />
          <p>
            Step factor:
            <br />
            <span
              style={{
                fontFamily: "monospace",
              }}
            >
              {stepFactor.toLocaleString()}
            </span>
          </p>
          <Slider
            min={MIN_LOG_STEP_FACTOR}
            max={MAX_LOG_STEP_FACTOR}
            value={logStepFactor}
            onChange={(val) => {
              setLogStepFactor(val as number);
            }}
          />
          <p>Speed-Invariant Accuracy:</p>
          <Slider
            min={
              logTicksPerRealSecond -
              logStepFactor -
              Math.min(
                MAX_LOG_STEP_FACTOR - logStepFactor,
                logTicksPerRealSecond - MIN_LOG_TICKS_PER_REAL_SECOND
              )
            }
            max={
              logTicksPerRealSecond -
              logStepFactor +
              Math.min(
                logStepFactor - MIN_LOG_STEP_FACTOR,
                MAX_LOG_TICKS_PER_REAL_SECOND - logTicksPerRealSecond
              )
            }
            value={logTicksPerRealSecond - logStepFactor}
            onChange={(val) => {
              const diff =
                (val as number) - (logTicksPerRealSecond - logStepFactor);
              setLogStepFactor((prev) => prev - diff);
              setLogTicksPerRealSecond((prev) => prev + diff);
            }}
          />
        </div>

        <h3>Stats</h3>
        <table>
          <tbody>
            <tr>
              <td>FPS</td>
              <td>{framesPerSecond.toFixed(1)}</td>
            </tr>
            <tr>
              <td>Compute Time</td>
              <td>{slowConvergingAdvanceTime.toFixed(3)} ms</td>
            </tr>
            <tr>
              <td>Ticks per s</td>
              <td>{actualTicksPerRealSecond.toExponential(3)}</td>
            </tr>
            <tr>
              <td>ms per tick</td>
              <td>{msPerTick.toExponential(3)}</td>
            </tr>
            <tr>
              <td>Total ticks</td>
              <td>{eulerSimulation.current.tick.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Stage
        width={window.innerWidth - PANEL_WIDTH}
        height={window.innerHeight}
        style={{ position: "absolute", left: PANEL_WIDTH }}
      >
        <Layer>
          {Array.from({ length: 21 }, (_, i) => i - 10).map((i) => (
            <>
              <Line
                key={i}
                points={[
                  horizontalMidpoint + i * UNIT_DISTANCE_IN_PX,
                  0,
                  horizontalMidpoint + i * UNIT_DISTANCE_IN_PX,
                  window.innerHeight,
                ]}
                stroke="#222"
                dash={[5, 5]}
              />
              <Line
                key={i + 100}
                points={[
                  0,
                  verticalMidpoint + i * UNIT_DISTANCE_IN_PX,
                  window.innerWidth,
                  verticalMidpoint + i * UNIT_DISTANCE_IN_PX,
                ]}
                stroke="#222"
                dash={[5, 5]}
              />
            </>
          ))}
        </Layer>
        <Layer>
          <Planet pos={planetPosAdjusted} />
          <Rocket pos={eulerRocketPosAdjusted} color="red" />
          <Rocket pos={implicitEulerRocketPosAdjusted} color="green" />
          <Rocket pos={verletRocketPosAdjusted} color="yellow" />
        </Layer>
      </Stage>
    </div>
  );
}

const Planet: React.FC<{ pos: Vec2D }> = ({ pos }) => {
  return <Circle x={pos.x} y={pos.y} radius={10} fill="blue" />;
};

const Rocket: React.FC<{ pos: Vec2D; color: string }> = ({ pos, color }) => {
  return <Circle x={pos.x} y={pos.y} radius={5} fill={color} />;
};

export default App;
