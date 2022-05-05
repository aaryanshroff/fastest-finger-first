const dot = (a: number[], b: number[]) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
const norm = (v: number[]) => Math.sqrt(v.reduce((m, n) => m + n * n, 0));

const angle_between = (u: number[], v: number[]) => {
  const dot_product = dot(u, v);
  const prod_norm = norm(u) * norm(v);
  return Math.acos(dot_product / prod_norm);
}

const mse = (a: number[], b: number[]) => {
	let error = 0;
	for (let i = 0; i < a.length; i++) {
		error += Math.pow((b[i] - a[i]), 2);
	}
	return error / a.length;
}

export { angle_between, mse };