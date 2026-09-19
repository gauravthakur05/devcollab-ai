import { useEffect, useState, useCallback } from 'react';
import { projectsApi } from '../api/projectsApi';

// Shared across Kanban / Sprints / Chat pages so each can offer a project
// picker without duplicating the fetch-and-remember-selection logic.
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    projectsApi
      .list()
      .then((res) => setProjects(res.data.data.projects))
      .catch((err) => setError(err.normalizedMessage || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, error, reload: load };
}
