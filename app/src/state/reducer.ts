import type {
  ProjectState, FrictionAngleResult, CohesionResult,
  DeformationModulusResult, SubgradeReactionResult,
  AnchorFrictionResult, PermeabilityResult, FinalSummaryResult,
  LayerSummary,
} from '../types';
import type { Action } from './actions';
import { calculateLayerSummaries } from '../calculations/nValue';
import { calculateFrictionAngle } from '../calculations/frictionAngle';
import { calculateCohesion } from '../calculations/cohesion';
import { calculateDeformationModulus } from '../calculations/deformationModulus';
import { calculateSubgradeReaction } from '../calculations/subgradeReaction';
import { calculateAnchorFriction } from '../calculations/anchorFriction';
import { calculateHazen, lookupCreager } from '../calculations/permeability';

let nextId = 1;
function genId() {
  return String(nextId++);
}

// 불러온 상태의 ID들과 충돌하지 않도록 카운터 재설정
export function syncNextId(state: ProjectState) {
  const allIds = [
    ...state.layers.map((l) => l.id),
    ...state.boreholes.map((b) => b.id),
    ...state.boreholes.flatMap((b) => b.measurements.map((m) => m.id)),
  ].map(Number).filter((n) => !isNaN(n));
  if (allIds.length > 0) nextId = Math.max(...allIds) + 1;
}

function toMap<T extends { layerId: string }>(arr: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const item of arr) m.set(item.layerId, item);
  return m;
}

function rebuildAll(state: ProjectState): ProjectState {
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);

  // 이전 상태를 Map으로 인덱싱 (O(1) 조회)
  const prevFaMap = toMap(state.frictionAngle);
  const prevCoMap = toMap(state.cohesion);
  const prevDmMap = toMap(state.deformationModulus);
  const prevSrMap = toMap(state.subgradeReaction);
  const prevAfMap = toMap(state.anchorFriction);
  const prevPmMap = toMap(state.permeability);
  const prevFsMap = toMap(state.finalSummary);

  const fa = rebuildFrictionAngle(summaries, prevFaMap);
  const co = rebuildCohesion(fa, prevCoMap);

  const faMap = toMap(fa);
  const coMap = toMap(co);

  const dm = rebuildDeformation(fa, prevDmMap);
  const dmMap = toMap(dm);

  const sr = rebuildSubgrade(fa, coMap, dmMap, prevSrMap);
  const af = rebuildAnchor(fa, coMap, dmMap, prevAfMap);
  const pm = rebuildPermeability(dm, prevPmMap);

  const srMap = toMap(sr);
  const afMap = toMap(af);
  const pmMap = toMap(pm);

  const fs = rebuildFinalSummary(summaries, faMap, coMap, dmMap, srMap, afMap, pmMap, prevFsMap);

  return { ...state, frictionAngle: fa, cohesion: co, deformationModulus: dm, subgradeReaction: sr, anchorFriction: af, permeability: pm, finalSummary: fs };
}

function rebuildFrictionAngle(summaries: LayerSummary[], prevMap: Map<string, FrictionAngleResult>): FrictionAngleResult[] {
  return summaries.map((s) => {
    const prev = prevMap.get(s.layerId);
    const appliedN = prev?.appliedN ?? s.representativeN;
    const calc = calculateFrictionAngle(appliedN);
    const applyMode = prev?.applyMode ?? 'formula';
    const appliedValue = applyMode === 'manual' && prev?.appliedValue != null
      ? prev.appliedValue : calc.average;
    return {
      layerId: s.layerId, appliedN, ...calc,
      testValue: prev?.testValue ?? null,
      nearbyData: prev?.nearbyData ?? null,
      appliedValue, applyMode,
    };
  });
}

function rebuildCohesion(fa: FrictionAngleResult[], prevMap: Map<string, CohesionResult>): CohesionResult[] {
  return fa.map((f) => {
    const prev = prevMap.get(f.layerId);
    const calc = calculateCohesion(f.appliedN);
    const applyMode = prev?.applyMode ?? 'formula';
    const appliedValue = applyMode === 'manual' && prev?.appliedValue != null
      ? prev.appliedValue : calc.average;
    return {
      layerId: f.layerId, appliedN: f.appliedN, ...calc,
      testValue: prev?.testValue ?? null,
      nearbyData: prev?.nearbyData ?? null,
      appliedValue, applyMode,
    };
  });
}

function rebuildDeformation(fa: FrictionAngleResult[], prevMap: Map<string, DeformationModulusResult>): DeformationModulusResult[] {
  return fa.map((f) => {
    const prev = prevMap.get(f.layerId);
    const soilType = prev?.soilType ?? null;
    const schmertmannAlpha = prev?.schmertmannAlpha ?? null;
    const bowlesType = prev?.bowlesType ?? null;
    const calc = calculateDeformationModulus(f.appliedN, soilType, schmertmannAlpha, bowlesType);
    const applyMode = prev?.applyMode ?? 'formula';
    const appliedValue = applyMode === 'manual' && prev?.appliedValue != null
      ? prev.appliedValue : calc.average;
    return {
      layerId: f.layerId, appliedN: f.appliedN,
      soilType, schmertmannAlpha, bowlesType, ...calc,
      testValue: prev?.testValue ?? null,
      nearbyData: prev?.nearbyData ?? null,
      appliedValue, applyMode,
    };
  });
}

function rebuildSubgrade(
  fa: FrictionAngleResult[], coMap: Map<string, CohesionResult>,
  dmMap: Map<string, DeformationModulusResult>, prevMap: Map<string, SubgradeReactionResult>
): SubgradeReactionResult[] {
  return fa.map((f) => {
    const prev = prevMap.get(f.layerId);
    const dmr = dmMap.get(f.layerId);
    const cor = coMap.get(f.layerId);
    const soilType = dmr?.soilType ?? null;
    const cohesion = cor?.appliedValue ?? 0;
    const calculatedValue = calculateSubgradeReaction(f.appliedN, soilType, cohesion);
    const applyMode = prev?.applyMode ?? 'formula';
    const appliedValue = applyMode === 'manual' && prev?.appliedValue != null
      ? prev.appliedValue : calculatedValue;
    return {
      layerId: f.layerId, appliedN: f.appliedN, soilType, cohesion,
      calculatedValue, appliedValue, applyMode,
    };
  });
}

function rebuildAnchor(
  fa: FrictionAngleResult[], coMap: Map<string, CohesionResult>,
  dmMap: Map<string, DeformationModulusResult>, prevMap: Map<string, AnchorFrictionResult>
): AnchorFrictionResult[] {
  return fa.map((f) => {
    const prev = prevMap.get(f.layerId);
    const dmr = dmMap.get(f.layerId);
    const cor = coMap.get(f.layerId);
    const soilType = dmr?.soilType ?? null;
    const cohesion = cor?.appliedValue ?? 0;
    const groundType = prev?.groundType ?? '모래';
    const calculatedValue = calculateAnchorFriction(f.appliedN, groundType, cohesion);
    return {
      layerId: f.layerId, appliedN: f.appliedN, soilType, groundType, cohesion,
      calculatedValue,
    };
  });
}

function rebuildPermeability(dm: DeformationModulusResult[], prevMap: Map<string, PermeabilityResult>): PermeabilityResult[] {
  return dm.map((d) => {
    const prev = prevMap.get(d.layerId);
    const d10 = prev?.d10 ?? null;
    const d20 = prev?.d20 ?? null;
    const hazen = (d10 !== null && d.soilType === '모래') ? calculateHazen(d10) : null;
    const creager = d20 !== null ? lookupCreager(d20) : null;
    const fieldTest = prev?.fieldTest ?? null;
    const nearbyData = prev?.nearbyData ?? null;
    const applyMode = prev?.applyMode ?? 'formula';

    let formulaValue: number | null = null;
    const formulaValues = [hazen, creager].filter((v): v is number => v !== null);
    if (formulaValues.length > 0) formulaValue = Math.max(...formulaValues);

    const appliedValue = applyMode === 'manual' && prev?.appliedValue != null
      ? prev.appliedValue : (formulaValue ?? 0);

    let remark = '';
    if (applyMode === 'manual') {
      if (fieldTest !== null) remark = '현장시험';
      else if (nearbyData !== null) remark = '인근자료';
      else remark = '직접입력';
    } else {
      if (hazen !== null && creager !== null) remark = hazen >= creager ? 'Hazen' : 'Creager';
      else if (hazen !== null) remark = 'Hazen';
      else if (creager !== null) remark = 'Creager';
    }

    return {
      layerId: d.layerId, soilType: d.soilType,
      d10, d20, hazen, creager, fieldTest, nearbyData,
      appliedValue, applyMode, remark,
    };
  });
}

function rebuildFinalSummary(
  summaries: LayerSummary[],
  faMap: Map<string, FrictionAngleResult>, coMap: Map<string, CohesionResult>,
  dmMap: Map<string, DeformationModulusResult>, srMap: Map<string, SubgradeReactionResult>,
  afMap: Map<string, AnchorFrictionResult>, pmMap: Map<string, PermeabilityResult>,
  prevMap: Map<string, FinalSummaryResult>
): FinalSummaryResult[] {
  return summaries.map((s) => {
    const prev = prevMap.get(s.layerId);
    const f = faMap.get(s.layerId);
    const c = coMap.get(s.layerId);
    const d = dmMap.get(s.layerId);
    const sr2 = srMap.get(s.layerId);
    const af2 = afMap.get(s.layerId);
    const p = pmMap.get(s.layerId);
    return {
      layerId: s.layerId, layerName: s.layerName,
      representativeN: s.representativeN,
      appliedN: f?.appliedN ?? s.representativeN,
      unitWeight: prev?.unitWeight ?? null,
      frictionAngle: f?.appliedValue ?? 0,
      cohesion: c?.appliedValue ?? 0,
      deformationModulus: d?.appliedValue ?? 0,
      subgradeReaction: sr2?.appliedValue ?? 0,
      anchorFriction: af2?.calculatedValue ?? 0,
      permeability: p?.appliedValue ?? null,
    };
  });
}

export function projectReducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'ADD_LAYER': {
      const id = genId();
      const newState = {
        ...state,
        layers: [...state.layers, { id, name: action.name, order: state.layers.length }],
      };
      return rebuildAll(newState);
    }
    case 'REMOVE_LAYER': {
      const newState = {
        ...state,
        layers: state.layers.filter((l) => l.id !== action.layerId),
        boreholes: state.boreholes.map((bh) => ({
          ...bh,
          measurements: bh.measurements.filter((m) => m.layerId !== action.layerId),
        })),
        frictionAngle: state.frictionAngle.filter((f) => f.layerId !== action.layerId),
        cohesion: state.cohesion.filter((c) => c.layerId !== action.layerId),
        deformationModulus: state.deformationModulus.filter((d) => d.layerId !== action.layerId),
        subgradeReaction: state.subgradeReaction.filter((s) => s.layerId !== action.layerId),
        anchorFriction: state.anchorFriction.filter((a) => a.layerId !== action.layerId),
        permeability: state.permeability.filter((p) => p.layerId !== action.layerId),
        finalSummary: state.finalSummary.filter((f) => f.layerId !== action.layerId),
      };
      return rebuildAll(newState);
    }
    case 'UPDATE_LAYER': {
      const newState = {
        ...state,
        layers: state.layers.map((l) => l.id === action.layerId ? { ...l, name: action.name } : l),
      };
      return rebuildAll(newState);
    }

    case 'ADD_BOREHOLE': {
      const id = genId();
      return {
        ...state,
        boreholes: [...state.boreholes, { id, name: action.name, measurements: [] }],
      };
    }
    case 'REMOVE_BOREHOLE': {
      const newState = {
        ...state,
        boreholes: state.boreholes.filter((bh) => bh.id !== action.boreholeId),
      };
      return rebuildAll(newState);
    }

    case 'ADD_MEASUREMENT': {
      const id = genId();
      const newState = {
        ...state,
        boreholes: state.boreholes.map((bh) =>
          bh.id === action.boreholeId
            ? {
                ...bh,
                measurements: [
                  ...bh.measurements,
                  { id, depth: bh.measurements.length + 1, layerId: action.layerId, nValue: action.nValue },
                ],
              }
            : bh
        ),
      };
      return rebuildAll(newState);
    }
    case 'UPDATE_MEASUREMENT': {
      const newState = {
        ...state,
        boreholes: state.boreholes.map((bh) =>
          bh.id === action.boreholeId
            ? {
                ...bh,
                measurements: bh.measurements.map((m) =>
                  m.id === action.measurementId
                    ? {
                        ...m,
                        ...(action.layerId !== undefined && { layerId: action.layerId }),
                        ...(action.nValue !== undefined && { nValue: action.nValue }),
                      }
                    : m
                ),
              }
            : bh
        ),
      };
      return rebuildAll(newState);
    }
    case 'REMOVE_MEASUREMENT': {
      const newState = {
        ...state,
        boreholes: state.boreholes.map((bh) =>
          bh.id === action.boreholeId
            ? { ...bh, measurements: bh.measurements.filter((m) => m.id !== action.measurementId) }
            : bh
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_FRICTION_ANGLE_INPUT': {
      const newState = {
        ...state,
        frictionAngle: state.frictionAngle.map((f) =>
          f.layerId === action.layerId
            ? {
                ...f,
                ...(action.appliedN !== undefined && { appliedN: action.appliedN }),
                ...(action.appliedValue !== undefined && { appliedValue: action.appliedValue }),
                ...(action.testValue !== undefined && { testValue: action.testValue }),
                ...(action.nearbyData !== undefined && { nearbyData: action.nearbyData }),
                ...(action.applyMode !== undefined && { applyMode: action.applyMode }),
              }
            : f
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_COHESION_INPUT': {
      const newState = {
        ...state,
        cohesion: state.cohesion.map((c) =>
          c.layerId === action.layerId
            ? {
                ...c,
                ...(action.appliedValue !== undefined && { appliedValue: action.appliedValue }),
                ...(action.testValue !== undefined && { testValue: action.testValue }),
                ...(action.nearbyData !== undefined && { nearbyData: action.nearbyData }),
                ...(action.applyMode !== undefined && { applyMode: action.applyMode }),
              }
            : c
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_DEFORMATION_INPUT': {
      const newState = {
        ...state,
        deformationModulus: state.deformationModulus.map((d) =>
          d.layerId === action.layerId
            ? {
                ...d,
                ...(action.appliedValue !== undefined && { appliedValue: action.appliedValue }),
                ...(action.soilType !== undefined && { soilType: action.soilType }),
                ...(action.schmertmannAlpha !== undefined && { schmertmannAlpha: action.schmertmannAlpha }),
                ...(action.bowlesType !== undefined && { bowlesType: action.bowlesType }),
                ...(action.testValue !== undefined && { testValue: action.testValue }),
                ...(action.nearbyData !== undefined && { nearbyData: action.nearbyData }),
                ...(action.applyMode !== undefined && { applyMode: action.applyMode }),
              }
            : d
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_SUBGRADE_INPUT': {
      const newState = {
        ...state,
        subgradeReaction: state.subgradeReaction.map((s) =>
          s.layerId === action.layerId
            ? {
                ...s,
                ...(action.appliedValue !== undefined && { appliedValue: action.appliedValue }),
                ...(action.applyMode !== undefined && { applyMode: action.applyMode }),
              }
            : s
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_ANCHOR_INPUT': {
      const newState = {
        ...state,
        anchorFriction: state.anchorFriction.map((a) =>
          a.layerId === action.layerId
            ? { ...a, ...(action.groundType !== undefined && { groundType: action.groundType }) }
            : a
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_PERMEABILITY_INPUT': {
      const newState = {
        ...state,
        permeability: state.permeability.map((p) =>
          p.layerId === action.layerId
            ? {
                ...p,
                ...(action.appliedValue !== undefined && { appliedValue: action.appliedValue }),
                ...(action.d10 !== undefined && { d10: action.d10 }),
                ...(action.d20 !== undefined && { d20: action.d20 }),
                ...(action.fieldTest !== undefined && { fieldTest: action.fieldTest }),
                ...(action.nearbyData !== undefined && { nearbyData: action.nearbyData }),
                ...(action.applyMode !== undefined && { applyMode: action.applyMode }),
              }
            : p
        ),
      };
      return rebuildAll(newState);
    }

    case 'UPDATE_UNIT_WEIGHT': {
      return {
        ...state,
        finalSummary: state.finalSummary.map((f) =>
          f.layerId === action.layerId ? { ...f, unitWeight: action.unitWeight } : f
        ),
      };
    }

    case 'LOAD_STATE': {
      syncNextId(action.payload);
      return { ...action.payload };
    }

    default:
      return state;
  }
}

export const initialState: ProjectState = {
  layers: [],
  boreholes: [],
  frictionAngle: [],
  cohesion: [],
  deformationModulus: [],
  subgradeReaction: [],
  anchorFriction: [],
  permeability: [],
  finalSummary: [],
  activeTab: 0,
};
