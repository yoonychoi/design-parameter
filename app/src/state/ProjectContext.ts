import { createContext } from 'react';
import type { ProjectState } from '../types';
import type { Action } from './actions';

export interface ProjectContextType {
  state: ProjectState;
  dispatch: React.Dispatch<Action>;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);
