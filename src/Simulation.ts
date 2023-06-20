import { Vec2D, copy } from "./vector";
import { planetGravity, planetRadius } from "./App";

export enum UpdateAlgorithm {
  Euler = "Euler",
  ImplicitEuler = "ImplicitEuler",
  Verlet = "Verlet",
  RungeKutta = "RungeKutta",
  Leapfrog = "Leapfrog",
  Midpoint = "Midpoint",
  Beeman = "Beeman",
  Gear = "Gear",
}

export class Simulation {
  public tick = 0;
  public initialRocketPos;
  public initialRocketVel;
  public rocketPos;
  public rocketVel;

  constructor(
    public algorithm: UpdateAlgorithm,
    public planetPos: Vec2D,
    initialRocketPos: Vec2D,
    initialRocketVel: Vec2D,
    public stepFactor: number
  ) {
    this.initialRocketPos = copy(initialRocketPos);
    this.initialRocketVel = copy(initialRocketVel);
    this.rocketPos = copy(initialRocketPos);
    this.rocketVel = copy(initialRocketVel);
  }

  public reset() {
    this.tick = 0;
    this.rocketPos = copy(this.initialRocketPos);
    this.rocketVel = copy(this.initialRocketVel);
  }

  public advance(n: number) {
    switch (this.algorithm) {
      case UpdateAlgorithm.Euler:
        this.advanceEuler(n);
        break;
      case UpdateAlgorithm.ImplicitEuler:
        this.advanceImplicitEuler(n);
        break;
      case UpdateAlgorithm.Verlet:
        this.advanceVerlet(n);
        break;
      default:
        throw new Error(`Algorithm not implemented: ${this.algorithm}`);
    }
  }

  public advanceEuler(n: number) {
    for (let i = 0; i < n; i++) {
      // this is  a proper implementation

      // const gravity = this.gravity();
      // this.rocketPos = add(
      //   this.rocketPos,
      //   scale(this.rocketVel, this.stepSize)
      // );
      // this.rocketVel = add(this.rocketVel, scale(gravity,
      // this.stepSize));

      // let's code it out by hand for performance

      const relPosX = this.rocketPos.x - this.planetPos.x;
      const relPosY = this.rocketPos.y - this.planetPos.y;

      const distance = Math.sqrt(relPosX * relPosX + relPosY * relPosY);
      const effectiveGravity = planetGravity * (planetRadius / distance) ** 2;

      const gravityX = (-effectiveGravity * relPosX) / distance;
      const gravityY = (-effectiveGravity * relPosY) / distance;

      this.rocketPos.x += this.rocketVel.x * this.stepFactor;
      this.rocketPos.y += this.rocketVel.y * this.stepFactor;
      this.rocketVel.x += gravityX * this.stepFactor;
      this.rocketVel.y += gravityY * this.stepFactor;

      this.tick++;
    }
  }

  public advanceImplicitEuler(n: number) {
    for (let i = 0; i < n; i++) {
      // this is  a proper implementation

      // const gravity = this.gravity();
      // this.rocketVel = add(this.rocketVel, scale(gravity, this.stepSize));
      // this.rocketPos = add(
      //   this.rocketPos,
      //   scale(this.rocketVel, this.stepSize)
      // );

      // again..

      const relPosX = this.rocketPos.x - this.planetPos.x;
      const relPosY = this.rocketPos.y - this.planetPos.y;

      const distance = Math.sqrt(relPosX * relPosX + relPosY * relPosY);
      const effectiveGravity = planetGravity * (planetRadius / distance) ** 2;

      const gravityX = (-effectiveGravity * relPosX) / distance;
      const gravityY = (-effectiveGravity * relPosY) / distance;

      this.rocketVel.x += gravityX * this.stepFactor;
      this.rocketVel.y += gravityY * this.stepFactor;
      this.rocketPos.x += this.rocketVel.x * this.stepFactor;
      this.rocketPos.y += this.rocketVel.y * this.stepFactor;

      this.tick++;
    }
  }

  public advanceVerlet(n: number) {
    for (let i = 0; i < n; i++) {
      const relPosX = this.rocketPos.x - this.planetPos.x;
      const relPosY = this.rocketPos.y - this.planetPos.y;

      const distance = Math.sqrt(relPosX * relPosX + relPosY * relPosY);
      const effectiveGravity = planetGravity * (planetRadius / distance) ** 2;

      const startingPointGravityX = (-effectiveGravity * relPosX) / distance;
      const startingPointGravityY = (-effectiveGravity * relPosY) / distance;

      const newPosX =
        relPosX +
        this.rocketVel.x * this.stepFactor +
        0.5 * startingPointGravityX * this.stepFactor * this.stepFactor;
      const newPosY =
        relPosY +
        this.rocketVel.y * this.stepFactor +
        0.5 * startingPointGravityY * this.stepFactor * this.stepFactor;

      const newDistance = Math.sqrt(newPosX * newPosX + newPosY * newPosY);
      const newEffectiveGravity =
        planetGravity * (planetRadius / newDistance) ** 2;

      const newGravityX = (-newEffectiveGravity * newPosX) / newDistance;
      const newGravityY = (-newEffectiveGravity * newPosY) / newDistance;

      this.rocketVel.x +=
        0.5 * (startingPointGravityX + newGravityX) * this.stepFactor;
      this.rocketVel.y +=
        0.5 * (startingPointGravityY + newGravityY) * this.stepFactor;

      this.rocketPos.x = newPosX;
      this.rocketPos.y = newPosY;

      this.tick++;
    }
  }
}
