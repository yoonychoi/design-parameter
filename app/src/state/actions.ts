import type {
  ApplyMode, SoilType, BowlesType, GroundType,
} from '../types';

export type Action =
  | { type: 'SET_TAB'; tab: number }
  // Layer
  | { type: 'ADD_LAYER'; name: string }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'UPDATE_LAYER'; layerId: string; name: string }
  // Borehole
  | { type: 'ADD_BOREHOLE'; name: string }
  | { type: 'REMOVE_BOREHOLE'; boreholeId: string }
  // Measurement
  | { type: 'ADD_MEASUREMENT'; boreholeId: string; layerId: string; nValue: number }
  | { type: 'UPDATE_MEASUREMENT'; boreholeId: string; measurementId: string; layerId?: string; nValue?: number }
  | { type: 'REMOVE_MEASUREMENT'; boreholeId: string; measurementId: string }
  // FrictionAngle
  | { type: 'UPDATE_FRICTION_ANGLE_INPUT'; layerId: string; appliedN?: number; appliedValue?: number; testValue?: number | null; nearbyData?: number | null; applyMode?: ApplyMode }
  // Cohesion
  | { type: 'UPDATE_COHESION_INPUT'; layerId: string; appliedValue?: number; testValue?: number | null; nearbyData?: number | null; applyMode?: ApplyMode }
  // DeformationModulus
  | { type: 'UPDATE_DEFORMATION_INPUT'; layerId: string; appliedValue?: number; soilType?: SoilType | null; schmertmannAlpha?: number | null; bowlesType?: BowlesType | null; testValue?: number | null; nearbyData?: number | null; applyMode?: ApplyMode }
  // SubgradeReaction
  | { type: 'UPDATE_SUBGRADE_INPUT'; layerId: string; appliedValue?: number; applyMode?: ApplyMode }
  // AnchorFriction
  | { type: 'UPDATE_ANCHOR_INPUT'; layerId: string; groundType?: GroundType }
  // Permeability
  | { type: 'UPDATE_PERMEABILITY_INPUT'; layerId: string; appliedValue?: number; d10?: number | null; d20?: number | null; fieldTest?: number | null; nearbyData?: number | null; applyMode?: ApplyMode }
  // FinalSummary
  | { type: 'UPDATE_UNIT_WEIGHT'; layerId: string; unitWeight: number | null };
