export type VehicleState = {
  x: number;
  z: number;
  heading: number;
  speed: number;
  steering: number;
};

export type VehicleInput = {
  throttle: number;
  brakeReverse: number;
  steerLeft: number;
  steerRight: number;
};

export type VehicleConfig = {
  length: number;
  width: number;
  wheelbase: number;
  frontOverhang: number;
  rearOverhang: number;
  maxSteer: number;
  maxSpeed: number;
  reverseSpeed: number;
  accel: number;
  decel: number;
  steerSpeed: number;
  steerReturn: number;
};
