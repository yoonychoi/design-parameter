import { useReducer, type ReactNode } from 'react';
import { ProjectContext } from './ProjectContext';
import { projectReducer, initialState } from './reducer';

export { ProjectContext };

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}
