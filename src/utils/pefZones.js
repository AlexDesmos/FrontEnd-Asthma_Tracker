import pefExact from '../data/pef_zones_exact_normalized.json';

export function getAgeYears(isoDate) {
  if (!isoDate) return null;
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  } catch {
    return null;
  }
}

export function normSex(s) {
  const x = String(s || '').trim().toLowerCase();
  if (['м', 'муж', 'мужской', 'male', 'm'].includes(x)) return 'муж';
  if (['ж', 'жен', 'женский', 'female', 'f'].includes(x)) return 'жен';
  return x;
}

export function pickExactNorm(sex, ageYears, heightCm, dataset = pefExact) {
  const rows = dataset?.rows ?? [];
  if (!rows.length) return null;

  const sx = normSex(sex);
  let candidates = rows.filter(r => normSex(r.sex) === sx);
  if (!candidates.length) return null;

  let ageMatches = candidates.filter(r => Number(r.age_years) === Number(ageYears));
  if (!ageMatches.length) {
    const withAgeScore = candidates.map(r => ({
      ...r,
      __ageDiff: Math.abs(Number(r.age_years) - Number(ageYears))
    }));
    const minAgeDiff = Math.min(...withAgeScore.map(x => x.__ageDiff));
    ageMatches = withAgeScore.filter(x => x.__ageDiff === minAgeDiff);
  }

  let bestByHeight = ageMatches.filter(r => Number(r.height_cm) === Number(heightCm));
  if (!bestByHeight.length) {
    const scored = ageMatches
      .map(r => ({ ...r, __hDiff: Math.abs(Number(r.height_cm) - Number(heightCm)) }))
      .sort((a, b) => a.__hDiff - b.__hDiff);
    bestByHeight = scored.length ? [scored[0]] : [];
  }
  return bestByHeight[0] || null;
}

export function buildPefZonesForPatient(patient, dataset = pefExact) {
  if (!patient) return null;

  const age = getAgeYears(patient.birthday);
  const sex = patient.sex;
  const height = Number(patient.height);

  if (!Number.isFinite(age) || !sex || !Number.isFinite(height)) return null;

  const ne = pickExactNorm(sex, age, height, dataset);
  if (!ne) return null;

  const pefPred = Number(ne.pef_pred_l_min);
  const redFrom = Number(ne.red_from ?? 0);
  const redTo = Number(ne.red_to ?? (pefPred ? 0.5 * pefPred : 0));
  const yellowFrom = Number(ne.yellow_from ?? (pefPred ? 0.5 * pefPred : 0));
  const yellowTo = Number(ne.yellow_to ?? (pefPred ? 0.8 * pefPred : 0));
  const greenFrom = Number(ne.green_from ?? (pefPred ? 0.8 * pefPred : 0));
  const greenTo = Number(ne.green_to ?? pefPred ?? 0);

  if (![pefPred, redFrom, redTo, yellowFrom, yellowTo, greenFrom, greenTo].every(Number.isFinite)) {
    return null;
  }
  return {
    red: [redFrom, redTo],
    yellow: [yellowFrom, yellowTo],
    green: [greenFrom, greenTo],
    norm: pefPred
  };
}
