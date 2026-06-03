import seedrandom from "https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm";

export class RNG {
  constructor(seed) {
    this.seed = seed;
    this.rng = seedrandom(seed);
    this.steps = 0;
  }

  random() {
    return this.rng();
  }

  random_choice(arr) {
    return arr[Math.floor(this.random() * arr.length)];
  }
}