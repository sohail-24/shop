import { describe, expect, it } from "vitest";

describe("Tex’s Chicken & Burgers About Page Content Verification", () => {
  it("verifies the official brand name, tagline and motto", () => {
    const brand = "Tex’s Chicken & Burgers";
    const formerBrand = "Texas Chicken & Burgers";
    const tagline = "Worth Every Bite";
    const motto = "Good Food Brings Good People";

    expect(brand).toBe("Tex’s Chicken & Burgers");
    expect(formerBrand).toBe("Texas Chicken & Burgers");
    expect(tagline).toBe("Worth Every Bite");
    expect(motto).toBe("Good Food Brings Good People");
  });

  it("verifies the verified historical milestones and footprint", () => {
    const origins = {
      era: "Late 1980s",
      location: "New York City",
      boroughs: ["The Bronx", "Harlem", "Brooklyn"],
      unificationYear: 2016,
      currentFootprint: "55+ locations across the East Coast",
    };

    expect(origins.era).toBe("Late 1980s");
    expect(origins.boroughs).toContain("The Bronx");
    expect(origins.boroughs).toContain("Harlem");
    expect(origins.boroughs).toContain("Brooklyn");
    expect(origins.unificationYear).toBe(2016);
    expect(origins.currentFootprint).toContain("55+");
  });

  it("verifies the food quality standards and halal commitments", () => {
    const qualityCommitments = [
      "100% Halal Certified",
      "Never Frozen",
      "Fresh Ingredients",
      "No Pink Slime",
      "No Ammonia Fillers",
    ];

    expect(qualityCommitments).toContain("100% Halal Certified");
    expect(qualityCommitments).toContain("Never Frozen");
    expect(qualityCommitments).toContain("No Pink Slime");
    expect(qualityCommitments).toContain("No Ammonia Fillers");
  });

  it("verifies the Tex's Rewards spurs loyalty structure", () => {
    const rewardsProgram = {
      pointsName: "Spurs",
      earningRate: "1 Spur per $1 spent",
      tiers: [
        { name: "Bronze", range: "0–999 Spurs" },
        { name: "Silver", range: "1,000–2,499 Spurs" },
        { name: "Gold", range: "2,500+ Spurs" },
      ],
      redemptions: [
        { item: "Warm Biscuit", spurs: 150 },
        { item: "Crispy Side", spurs: 250 },
        { item: "2 PC Chicken", spurs: 400 },
        { item: "Cheeseburger", spurs: 500 },
        { item: "3 PC Tenders", spurs: 750 },
      ],
    };

    expect(rewardsProgram.pointsName).toBe("Spurs");
    expect(rewardsProgram.tiers).toHaveLength(3);
    expect(rewardsProgram.redemptions[0].spurs).toBe(150);
    expect(rewardsProgram.redemptions[4].spurs).toBe(750);
  });
});
