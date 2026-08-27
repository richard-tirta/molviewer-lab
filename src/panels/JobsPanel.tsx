import { useEffect, useState } from 'react';

type Job = { id: string; label: string; progress: number; status: 'queued' | 'running' | 'done' };

const SEED: Job[] = [
  { id: 'j1', label: 'Dock indinavir → 1HSG (crystal site)', progress: 100, status: 'done' },
  { id: 'j2', label: 'Batch screen 2,000 SMILES → 1HSG', progress: 37, status: 'running' },
  { id: 'j3', label: 'ADMET profile top-50 hits', progress: 0, status: 'queued' },
];

/** Mine: a fake background-job list that ticks, to shape the "don't babysit a tab" UX. */
export function JobsPanel() {
  const [jobs, setJobs] = useState(SEED);
  useEffect(() => {
    const t = setInterval(() => {
      setJobs((js) => js.map((j) => {
        if (j.status !== 'running') return j;
        const p = Math.min(100, j.progress + 1);
        return { ...j, progress: p, status: p === 100 ? 'done' : 'running' };
      }));
    }, 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="panel">
      <h2>Jobs</h2>
      <ul className="jobs">
        {jobs.map((j) => (
          <li key={j.id} className={`job job-${j.status}`}>
            <div className="job-row"><span>{j.label}</span><span className="muted">{j.status}</span></div>
            <div className="bar"><div className="bar-fill" style={{ width: `${j.progress}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
