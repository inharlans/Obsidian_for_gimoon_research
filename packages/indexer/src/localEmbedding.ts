export const LOCAL_VECTOR_DIMENSIONS = 256;
export const LOCAL_VECTOR_MODEL = "paperkg-hashed-ngrams-v1";

function hashFeature(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function features(input: string): string[] {
  const normalized = input.normalize("NFKC").toLocaleLowerCase();
  const tokens = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const output = [...tokens.map((token) => `w:${token}`)];
  for (let index = 0; index + 1 < tokens.length; index += 1) output.push(`b:${tokens[index]}_${tokens[index + 1]}`);
  for (const token of tokens) {
    const padded = `^${token}$`;
    for (let index = 0; index + 2 < padded.length; index += 1) output.push(`c:${padded.slice(index, index + 3)}`);
  }
  return output;
}

export function embedLocally(input: string, dimensions = LOCAL_VECTOR_DIMENSIONS): number[] {
  const counts = new Map<string, number>();
  for (const feature of features(input)) counts.set(feature, (counts.get(feature) ?? 0) + 1);
  const vector = Array.from({ length: dimensions }, () => 0);
  for (const [feature, count] of counts) {
    const hash = hashFeature(feature);
    const index = hash % dimensions;
    const sign = (hash & 0x80000000) === 0 ? 1 : -1;
    vector[index] = (vector[index] ?? 0) + sign * (1 + Math.log(count));
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm === 0 ? vector : vector.map((value) => value / norm);
}

export function cosineOfNormalized(left: number[], right: number[]): number {
  const length = Math.min(left.length, right.length);
  let score = 0;
  for (let index = 0; index < length; index += 1) score += (left[index] ?? 0) * (right[index] ?? 0);
  return score;
}
