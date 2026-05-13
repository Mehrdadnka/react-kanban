import * as THREE from 'three';

export interface JetEngineData {
  flameMaterial: THREE.ShaderMaterial;
  innerMaterial: THREE.ShaderMaterial;
  bladeGroup: THREE.Group;
  flameMesh: THREE.Mesh;
}

export interface EngineRef {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  update: (time: number) => void;
}

export type LampState = 'idle' | 'warning' | 'landing' | 'flight' | 'jet' | 'allJets';

export interface RobotLegParams {
  arm1?: { width: number; height: number; depth: number; color: number };
  arm2?: { width: number; height: number; depth: number; color: number };
  arm3?: { width: number; height: number; depth: number; color: number };
  arm4?: { width: number; height: number; depth: number; color: number };
  base?: { leg: { width: number; height: number; depth: number; color: number } };
}