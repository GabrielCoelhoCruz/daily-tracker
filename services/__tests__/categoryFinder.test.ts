import { findCategories, CategoryResult } from "../categoryFinder";

function findByName(results: CategoryResult[], name: string): CategoryResult {
  const r = results.find((r) => r.name === name);
  if (!r) throw new Error(`Category "${name}" not found in results`);
  return r;
}

describe("findCategories", () => {
  describe("male 172cm / 85kg", () => {
    const results = findCategories({
      gender: "male",
      heightCm: 172,
      currentWeightKg: 85,
    });

    it("returns 6 categories", () => {
      expect(results).toHaveLength(6);
    });

    it("Men's Physique: Class B, eligible, no weight limit", () => {
      const r = findByName(results, "Men's Physique");
      expect(r.className).toBe("Class B (≤173cm)");
      expect(r.status).toBe("✅");
      expect(r.maxWeightKg).toBeNull();
    });

    it("Muscular Men's Physique: Open, eligible", () => {
      const r = findByName(results, "Muscular Men's Physique");
      expect(r.className).toBe("Open");
      expect(r.status).toBe("✅");
    });

    it("Classic Physique: Class C, max 80kg, delta 5kg", () => {
      const r = findByName(results, "Classic Physique");
      expect(r.className).toBe("Class C (≤175cm)");
      expect(r.maxWeightKg).toBe(80); // 172 - 100 + 8
      expect(r.deltaKg).toBe(5);
      expect(r.status).toBe("⚠️"); // exactly 5kg over = ⚠️
      expect(r.eligible).toBe(false);
    });

    it("Classic Bodybuilding: Class C, max 78kg, delta 7kg", () => {
      const r = findByName(results, "Classic Bodybuilding");
      expect(r.className).toBe("Class C (≤175cm)");
      expect(r.maxWeightKg).toBe(78); // 172 - 100 + 6
      expect(r.deltaKg).toBe(7);
      expect(r.status).toBe("❌"); // 7kg over > 5
    });

    it("Bodybuilding IFBB: Middleweight by height", () => {
      const r = findByName(results, "Bodybuilding (IFBB)");
      expect(r.className).toBe("Middleweight (≤175cm)");
      expect(r.status).toBe("✅");
    });

    it("Bodybuilding NPC: Light-Heavyweight by weight", () => {
      const r = findByName(results, "Bodybuilding (NPC)");
      expect(r.className).toBe("Light-Heavyweight (≤89.8kg)");
      expect(r.status).toBe("✅");
    });
  });

  describe("female 165cm / 60kg", () => {
    const results = findCategories({
      gender: "female",
      heightCm: 165,
      currentWeightKg: 60,
    });

    it("returns 7 categories", () => {
      expect(results).toHaveLength(7);
    });

    it("all height-only categories are ✅", () => {
      const heightCategories = [
        "Women's Bikini",
        "Women's Wellness",
        "Women's Figure",
        "Women's Physique",
        "Women's Bodyfitness",
        "Women's Fit Model",
      ];
      for (const name of heightCategories) {
        const r = findByName(results, name);
        expect(r.status).toBe("✅");
        expect(r.eligible).toBe(true);
      }
    });

    it("Bikini: Class E (≤166cm)", () => {
      const r = findByName(results, "Women's Bikini");
      expect(r.className).toBe("Class E (≤166cm)");
    });

    it("Wellness: Class C (≤168cm)", () => {
      const r = findByName(results, "Women's Wellness");
      expect(r.className).toBe("Class C (≤168cm)");
    });

    it("Figure: Class C (≤168cm)", () => {
      const r = findByName(results, "Women's Figure");
      expect(r.className).toBe("Class C (≤168cm)");
    });

    it("Women's Physique: Class B (>163cm)", () => {
      const r = findByName(results, "Women's Physique");
      expect(r.className).toBe("Class B (>163cm)");
    });

    it("Women's Bodybuilding: Light-Heavyweight (≤63.5kg)", () => {
      const r = findByName(results, "Women's Bodybuilding");
      expect(r.className).toBe("Light-Heavyweight (≤63.5kg)");
    });

    it("Women's Bodyfitness: Class C (≤168cm)", () => {
      const r = findByName(results, "Women's Bodyfitness");
      expect(r.className).toBe("Class C (≤168cm)");
    });

    it("Women's Fit Model: Class C (≤166cm)", () => {
      const r = findByName(results, "Women's Fit Model");
      expect(r.className).toBe("Class C (≤166cm)");
    });
  });

  describe("Classic Physique weight formula edge cases", () => {
    it("exactly at limit → ✅ eligible", () => {
      // 172cm → max = 72 + 8 = 80kg
      const results = findCategories({
        gender: "male",
        heightCm: 172,
        currentWeightKg: 80,
      });
      const r = findByName(results, "Classic Physique");
      expect(r.status).toBe("✅");
      expect(r.eligible).toBe(true);
      expect(r.deltaKg).toBe(0);
    });

    it("1kg over → ⚠️", () => {
      const results = findCategories({
        gender: "male",
        heightCm: 172,
        currentWeightKg: 81,
      });
      const r = findByName(results, "Classic Physique");
      expect(r.status).toBe("⚠️");
      expect(r.eligible).toBe(false);
      expect(r.deltaKg).toBe(1);
    });

    it("5kg over → ⚠️", () => {
      const results = findCategories({
        gender: "male",
        heightCm: 172,
        currentWeightKg: 85,
      });
      const r = findByName(results, "Classic Physique");
      expect(r.status).toBe("⚠️");
      expect(r.deltaKg).toBe(5);
    });

    it("6kg over → ❌", () => {
      const results = findCategories({
        gender: "male",
        heightCm: 172,
        currentWeightKg: 86,
      });
      const r = findByName(results, "Classic Physique");
      expect(r.status).toBe("❌");
      expect(r.deltaKg).toBe(6);
    });
  });
});
