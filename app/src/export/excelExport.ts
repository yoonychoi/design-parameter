import type { ProjectState, LayerSummary } from '../types';
import { calculateLayerSummaries } from '../calculations/nValue';

export async function exportToExcel(state: ProjectState) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const summaries = calculateLayerSummaries(state.layers, state.boreholes);

  // summaries를 Map으로 인덱싱 (O(n) -> O(1) 조회)
  const summaryMap = new Map<string, LayerSummary>();
  for (const s of summaries) {
    summaryMap.set(s.layerId, s);
  }

  // 1. 설계지반정수 요약
  const summaryData = state.finalSummary.map((r) => ({
    '지층명': r.layerName,
    '대표N값': r.representativeN,
    '적용N값': r.appliedN,
    '단위중량(kN/m³)': r.unitWeight ?? '',
    '점착력 c(kPa)': Number(r.cohesion.toFixed(1)),
    '내부마찰각 φ(°)': r.frictionAngle,
    '변형계수 E(MPa)': Number(r.deformationModulus.toFixed(1)),
    '수평지반반력계수(kN/m³)': r.subgradeReaction,
    '앵커주면마찰저항(kN/m²)': r.anchorFriction,
    '투수계수 k(cm/sec)': r.permeability,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), '설계지반정수');

  // 2. N값 분포
  const nData = summaries.map((s) => ({
    '지층명': s.layerName,
    '측정치 수': s.count,
    '대표N값(평균)': s.representativeN,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nData), 'N값분포');

  // 3. 내부마찰각
  const faData = state.frictionAngle.map((r) => {
    const s = summaryMap.get(r.layerId);
    return {
      '지층명': s?.layerName,
      '대표N': s?.representativeN,
      '적용N': r.appliedN,
      'Dunham': Number(r.dunham.toFixed(1)),
      'Peck': Number(r.peck.toFixed(1)),
      'Meyerhof': r.meyerhof !== null ? Number(r.meyerhof.toFixed(1)) : '',
      'Ohsaki': Number(r.ohsaki.toFixed(1)),
      '도로교시방서': Number(r.roadBridge.toFixed(1)),
      '평균': r.average,
      '범위': `${r.min.toFixed(1)}~${r.max.toFixed(1)}`,
      '시험값': r.testValue ?? '',
      '인근자료': r.nearbyData ?? '',
      '적용값': r.appliedValue,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(faData), '내부마찰각');

  // 4. 점착력
  const coData = state.cohesion.map((r) => {
    const s = summaryMap.get(r.layerId);
    return {
      '지층명': s?.layerName,
      '적용N': r.appliedN,
      'Dunham': Number(r.dunham.toFixed(1)),
      'Terzaghi-Peck': Number(r.terzaghiPeck.toFixed(1)),
      'Ohsaki': Number(r.ohsaki.toFixed(1)),
      '평균': Number(r.average.toFixed(1)),
      '범위': `${r.min.toFixed(1)}~${r.max.toFixed(1)}`,
      '적용값': Number(r.appliedValue.toFixed(1)),
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(coData), '점착력');

  // 5. 변형계수
  const dmData = state.deformationModulus.map((r) => {
    const s = summaryMap.get(r.layerId);
    return {
      '지층명': s?.layerName,
      '적용N': r.appliedN,
      '지층구분': r.soilType ?? '',
      'Schmertmann': r.schmertmann !== null ? Number(r.schmertmann.toFixed(1)) : '',
      'Bowles': r.bowles !== null ? Number(r.bowles.toFixed(1)) : '',
      'Yoshinaka': Number(r.yoshinaka.toFixed(1)),
      'Hisatake': Number(r.hisatake.toFixed(1)),
      '도로교시방서': Number(r.roadBridge.toFixed(1)),
      '구조물기초설계기준': r.foundationStd !== null ? Number(r.foundationStd.toFixed(1)) : '',
      '평균': Number(r.average.toFixed(1)),
      '적용값': Number(r.appliedValue.toFixed(1)),
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dmData), '변형계수');

  // 6. 수평지반반력계수
  const srData = state.subgradeReaction.map((r) => {
    const s = summaryMap.get(r.layerId);
    return {
      '지층명': s?.layerName,
      '적용N': r.appliedN,
      '지층구분': r.soilType ?? '',
      '점착력(kPa)': Number(r.cohesion.toFixed(1)),
      '경험식 산정값': r.calculatedValue,
      '적용값': r.appliedValue,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(srData), '수평지반반력계수');

  // 7. 앵커주면마찰저항
  const afData = state.anchorFriction.map((r) => {
    const s = summaryMap.get(r.layerId);
    return {
      '지층명': s?.layerName,
      '적용N': r.appliedN,
      '지반의 종류': r.groundType,
      '점착력(kPa)': Number(r.cohesion.toFixed(1)),
      '산정값(kN/m²)': r.calculatedValue,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(afData), '앵커주면마찰저항');

  // 8. 투수계수
  const pmData = state.permeability.map((r) => {
    const s = summaryMap.get(r.layerId);
    return {
      '지층명': s?.layerName,
      '지층구분': r.soilType ?? '',
      'D10(mm)': r.d10 ?? '',
      'D20(mm)': r.d20 ?? '',
      'Hazen': r.hazen,
      'Creager': r.creager,
      '현장시험': r.fieldTest ?? '',
      '인근자료': r.nearbyData ?? '',
      '적용값': r.appliedValue,
      '비고': r.remark,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pmData), '투수계수');

  XLSX.writeFile(wb, '설계지반정수_산정결과.xlsx');
}
