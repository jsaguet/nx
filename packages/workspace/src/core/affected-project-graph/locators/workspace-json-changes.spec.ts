import { getTouchedProjectsInWorkspaceJson } from './workspace-json-changes';
import { WholeFileChange } from '../../file-utils';
import { DiffType } from '../../../utils/json-diff';

describe('getTouchedProjectsInWorkspaceJson', () => {
  it('should not return changes when angular.json is not touched', () => {
    const result = getTouchedProjectsInWorkspaceJson(
      [
        {
          file: 'source.ts',
          ext: '.ts',
          mtime: 0,
          getChanges: () => [new WholeFileChange()]
        }
      ],
      {},
      {
        npmScope: 'proj',
        projects: {
          proj1: {
            tags: []
          }
        }
      }
    );
    expect(result).toEqual([]);
  });

  it('should return all projects for a whole file change', () => {
    const result = getTouchedProjectsInWorkspaceJson(
      [
        {
          file: 'angular.json',
          ext: '.json',
          mtime: 0,
          getChanges: () => [new WholeFileChange()]
        }
      ],
      {
        npmScope: 'proj',
        projects: {
          proj1: {
            tags: []
          },
          proj2: {
            tags: []
          }
        }
      }
    );
    expect(result).toEqual(['proj1', 'proj2']);
  });

  it('should return all projects for changes to newProjectRoot', () => {
    const result = getTouchedProjectsInWorkspaceJson(
      [
        {
          file: 'angular.json',
          ext: '.json',
          mtime: 0,
          getChanges: () => [
            {
              type: DiffType.Modified,
              path: ['newProjectRoot'],
              value: {
                lhs: '',
                rhs: 'projects'
              }
            }
          ]
        }
      ],
      {
        newProjectRoot: 'projects',
        projects: {
          proj1: {
            tags: []
          },
          proj2: {
            tags: []
          }
        }
      }
    );
    expect(result).toEqual(['proj1', 'proj2']);
  });

  it('should return projects added in angular.json', () => {
    const result = getTouchedProjectsInWorkspaceJson(
      [
        {
          file: 'angular.json',
          ext: '.json',
          mtime: 0,
          getChanges: () => [
            {
              type: DiffType.Added,
              path: ['projects', 'proj1', 'tags'],
              value: {
                lhs: undefined,
                rhs: []
              }
            }
          ]
        }
      ],
      {
        projects: {
          proj1: {
            root: 'proj1'
          }
        }
      }
    );
    expect(result).toEqual(['proj1']);
  });

  it('should affect all projects if a project is removed from angular.json', () => {
    const result = getTouchedProjectsInWorkspaceJson(
      [
        {
          file: 'angular.json',
          ext: '.json',
          mtime: 0,
          getChanges: () => [
            {
              type: DiffType.Deleted,
              path: ['projects', 'proj3', 'root'],
              value: {
                lhs: 'proj3',
                rhs: undefined
              }
            }
          ]
        }
      ],
      {
        projects: {
          proj1: {
            root: 'proj1'
          },
          proj2: {
            root: 'proj2'
          }
        }
      }
    );
    expect(result).toEqual(['proj1', 'proj2']);
  });

  it('should return projects modified in angular.json', () => {
    const result = getTouchedProjectsInWorkspaceJson(
      [
        {
          file: 'angular.json',
          ext: '.json',
          mtime: 0,
          getChanges: () => [
            {
              type: DiffType.Modified,
              path: ['projects', 'proj1', 'root'],
              value: {
                lhs: 'proj3',
                rhs: 'proj1'
              }
            }
          ]
        }
      ],
      {
        projects: {
          proj1: {
            root: 'proj1'
          },
          proj2: {
            root: 'proj2'
          }
        }
      }
    );
    expect(result).toEqual(['proj1']);
  });
});
