import type { Layer, Borehole, LayerSummary } from '../types';

export function calculateLayerSummaries(
  layers: Layer[],
  boreholes: Borehole[]
): LayerSummary[] {
  return layers.map((layer) => {
    const allNValues: number[] = [];
    for (const bh of boreholes) {
      for (const m of bh.measurements) {
        if (m.layerId === layer.id) {
          allNValues.push(m.nValue);
        }
      }
    }
    const count = allNValues.length;
    const representativeN =
      count > 0 ? Math.floor(allNValues.reduce((a, b) => a + b, 0) / count) : 0;

    return {
      layerId: layer.id,
      layerName: layer.name,
      count,
      representativeN,
    };
  });
}
