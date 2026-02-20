# 04. 내부 인터페이스 설계서 (API 설계서 대체)

> 작성일: 2026-02-19

---

## 1. 개요

본 프로젝트는 서버가 없는 SPA이므로 외부 API가 존재하지 않는다. 이 문서는 API 설계서 대신 **계산 모듈의 함수 인터페이스**와 **상태 관리 액션**을 정의한다.

---

## 2. 계산 모듈 함수 인터페이스

### 2.1 N값 분포 (`calculations/nValue.ts`)

```typescript
/** 지층별 대표 N값(평균)과 측정치 수를 산출한다 */
function calculateLayerSummaries(
  layers: Layer[],
  boreholes: Borehole[]
): LayerSummary[];
```

### 2.2 내부마찰각 (`calculations/frictionAngle.ts`)

```typescript
/** 단일 지층의 내부마찰각 경험식을 산정한다 */
function calculateFrictionAngle(n: number): {
  dunham: number;
  peck: number;
  meyerhof: number | null;     // N < 10이면 null
  ohsaki: number;
  roadBridge: number;
  average: number;             // 소수점 절사, null 제외
  min: number;
  max: number;
};
```

### 2.3 점착력 (`calculations/cohesion.ts`)

```typescript
/** 단일 지층의 점착력 경험식을 산정한다 (c = qu/2) */
function calculateCohesion(n: number): {
  dunham: number;              // (N/0.077) / 2
  terzaghiPeck: number;       // (N/0.082) / 2
  ohsaki: number;              // (40 + N/0.2) / 2
  average: number;
  min: number;
  max: number;
};
```

### 2.4 변형계수 (`calculations/deformationModulus.ts`)

```typescript
/** 단일 지층의 변형계수 경험식을 산정한다 */
function calculateDeformationModulus(
  n: number,
  soilType: SoilType | null,
  schmertmannAlpha: number | null,
  bowlesType: BowlesType | null
): {
  schmertmann: number | null;
  bowles: number | null;
  yoshinaka: number;
  hisatake: number;
  roadBridge: number;
  foundationStd: number | null;
  average: number;              // null 제외 평균
  min: number;
  max: number;
};
```

### 2.5 수평지반반력계수 (`calculations/subgradeReaction.ts`)

```typescript
/** 단일 지층의 수평지반반력계수를 산정한다 */
function calculateSubgradeReaction(
  n: number,
  soilType: SoilType,
  cohesion: number
): number;
```

### 2.6 앵커주면마찰저항 (`calculations/anchorFriction.ts`)

```typescript
/** 단일 지층의 앵커주면마찰저항을 산정한다 */
function calculateAnchorFriction(
  n: number,
  groundType: GroundType,
  cohesion: number
): number;
```

### 2.7 투수계수 (`calculations/permeability.ts`)

```typescript
/** Hazen 투수계수를 산정한다 */
function calculateHazen(d10: number): number;
// k = 1.5 × D10²

/** Creager 투수계수를 산정한다 (참조테이블 보간) */
function calculateCreager(d20: number): number;

/** D20 값으로 Creager 테이블을 조회한다 */
function lookupCreagerTable(d20: number): number;
```

---

## 3. 상태 관리 액션 목록

### 3.1 지층 관리

| 액션 | Payload | 설명 |
|------|---------|------|
| `ADD_LAYER` | `{ name: string }` | 지층 추가 |
| `REMOVE_LAYER` | `{ layerId: string }` | 지층 삭제 (cascade) |
| `UPDATE_LAYER` | `{ layerId: string, name: string }` | 지층명 수정 |
| `REORDER_LAYERS` | `{ layerIds: string[] }` | 지층 순서 변경 |

### 3.2 시추공 관리

| 액션 | Payload | 설명 |
|------|---------|------|
| `ADD_BOREHOLE` | `{ name: string }` | 시추공 추가 |
| `REMOVE_BOREHOLE` | `{ boreholeId: string }` | 시추공 삭제 (cascade) |
| `UPDATE_BOREHOLE` | `{ boreholeId: string, name: string }` | 공번 수정 |

### 3.3 측정값 관리

| 액션 | Payload | 설명 |
|------|---------|------|
| `ADD_MEASUREMENT` | `{ boreholeId: string, layerId: string, nValue: number }` | 측정 행 추가 |
| `UPDATE_MEASUREMENT` | `{ boreholeId: string, measurementId: string, ...fields }` | 측정값 수정 |
| `REMOVE_MEASUREMENT` | `{ boreholeId: string, measurementId: string }` | 측정 행 삭제 |

### 3.4 모듈별 사용자 입력

| 액션 | Payload | 설명 |
|------|---------|------|
| `UPDATE_FRICTION_ANGLE_INPUT` | `{ layerId, appliedN?, testValue?, nearbyData?, applyMode? }` | 내부마찰각 입력 |
| `UPDATE_COHESION_INPUT` | `{ layerId, nearbyData?, applyMode? }` | 점착력 입력 |
| `UPDATE_DEFORMATION_INPUT` | `{ layerId, soilType?, schmertmannAlpha?, bowlesType?, testValue?, nearbyData?, applyMode? }` | 변형계수 입력 |
| `UPDATE_SUBGRADE_INPUT` | `{ layerId, appliedValue?, applyMode? }` | 수평지반반력 입력 |
| `UPDATE_ANCHOR_INPUT` | `{ layerId, groundType? }` | 앵커주면마찰 입력 |
| `UPDATE_PERMEABILITY_INPUT` | `{ layerId, d10?, d20?, fieldTest?, nearbyData?, applyMode? }` | 투수계수 입력 |
| `UPDATE_UNIT_WEIGHT` | `{ layerId, unitWeight: number }` | 단위중량 입력 |

---

## 4. 엑셀 내보내기 인터페이스

```typescript
/** 전체 상태를 엑셀 파일로 내보낸다 */
function exportToExcel(state: ProjectState): void;
```

생성되는 엑셀 시트 구성:

| 시트 순서 | 시트명 | 내용 |
|----------|--------|------|
| 1 | 설계지반정수 | 최종 요약 테이블 |
| 2 | N값분포 | 지층별 대표N값, 측정치 수 |
| 3 | 내부마찰각 | 경험식별 산정값, 적용값 |
| 4 | 점착력 | 경험식별 산정값, 적용값 |
| 5 | 변형계수 | 경험식별 산정값, 적용값 |
| 6 | 수평지반반력계수 | 산정값, 적용값 |
| 7 | 앵커주면마찰저항 | 산정값 |
| 8 | 투수계수 | 산정값, 적용값, 비고 |
