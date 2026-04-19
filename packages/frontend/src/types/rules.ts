export type TrainingStatus = "idle" | "running" | "success" | "failure";

export type TrainingResult =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; reason: "parking_zone" | "trigger_line"; goalId: string }
  | { status: "failure"; reason: "collision" | "out_of_bounds"; objectId?: string };
