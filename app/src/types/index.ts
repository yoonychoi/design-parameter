export interface Layer {
  id: string;
  name: string;
  order: number;
}

export interface Measurement {
  id: string;
  depth: number;
  layerId: string;
  nValue: number;
}

export interface Borehole {
  id: string;
  name: string;
  measurements: Measurement[];
}

export interface LayerSummary {
  layerId: string;
  layerName: string;
  count: number;
  representativeN: number;
}

export type ApplyMode = 'formula' | 'manual';
export type SoilType = '점토' | '실트' | '모래' | '자갈';
export type BowlesType = 1 | 2 | 3 | 4;
export type GroundType = '모래' | '점토' | '모래자갈' | '경암' | '연암' | '풍화암' | '파쇄대';

export interface FrictionAngleResult {
  layerId: string;
  appliedN: number;
  dunham: number;
  peck: number;
  meyerhof: number | null;
  ohsaki: number;
  roadBridge: number;
  average: number;
  min: number;
  max: number;
  testValue: number | null;
  nearbyData: number | null;
  appliedValue: number;
  applyMode: ApplyMode;
}

export interface CohesionResult {
  layerId: string;
  appliedN: number;
  dunham: number;
  terzaghiPeck: number;
  ohsaki: number;
  average: number;
  min: number;
  max: number;
  testValue: number | null;
  nearbyData: number | null;
  appliedValue: number;
  applyMode: ApplyMode;
}

export interface DeformationModulusResult {
  layerId: string;
  appliedN: number;
  soilType: SoilType | null;
  schmertmannAlpha: number | null;
  bowlesType: BowlesType | null;
  schmertmann: number | null;
  bowles: number | null;
  yoshinaka: number;
  hisatake: number;
  roadBridge: number;
  foundationStd: number | null;
  average: number;
  min: number;
  max: number;
  testValue: number | null;
  nearbyData: number | null;
  appliedValue: number;
  applyMode: ApplyMode;
}

export interface SubgradeReactionResult {
  layerId: string;
  appliedN: number;
  soilType: SoilType | null;
  cohesion: number;
  calculatedValue: number;
  appliedValue: number;
  applyMode: ApplyMode;
}

export interface AnchorFrictionResult {
  layerId: string;
  appliedN: number;
  soilType: SoilType | null;
  groundType: GroundType;
  cohesion: number;
  calculatedValue: number;
}

export interface PermeabilityResult {
  layerId: string;
  soilType: SoilType | null;
  d10: number | null;
  d20: number | null;
  hazen: number | null;
  creager: number | null;
  fieldTest: number | null;
  nearbyData: number | null;
  appliedValue: number;
  applyMode: ApplyMode;
  remark: string;
}

export interface FinalSummaryResult {
  layerId: string;
  layerName: string;
  representativeN: number;
  appliedN: number;
  unitWeight: number | null;
  frictionAngle: number;
  cohesion: number;
  deformationModulus: number;
  subgradeReaction: number;
  anchorFriction: number;
  permeability: number | null;
}

export interface ProjectState {
  layers: Layer[];
  boreholes: Borehole[];
  frictionAngle: FrictionAngleResult[];
  cohesion: CohesionResult[];
  deformationModulus: DeformationModulusResult[];
  subgradeReaction: SubgradeReactionResult[];
  anchorFriction: AnchorFrictionResult[];
  permeability: PermeabilityResult[];
  finalSummary: FinalSummaryResult[];
  activeTab: number;
}
