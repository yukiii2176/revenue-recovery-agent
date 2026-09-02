const BASE_URL = 'http://127.0.0.1:8000';

export async function fetchInvestigateAll() {
  const res = await fetch(`${BASE_URL}/investigate-all`);
  if (!res.ok) throw new Error('Failed to fetch investigation data');
  return res.json();
}

export async function fetchSimulateRecovery() {
  const res = await fetch(`${BASE_URL}/simulate-recovery`);
  if (!res.ok) throw new Error('Failed to run recovery simulation');
  return res.json();
}
