const { analyzeConfiguration } = require('../src/services/recommendationService');

describe('analyzeConfiguration', () => {
  test('recommends PSU upgrade when insufficient', () => {
    const result = analyzeConfiguration({
      CPU: { perf_score: 250, tdp: 65 },
      GPU: { perf_score: 520, metadata_json: { recommendedPsu: 700 }, tdp: 263 },
      PSU: { wattage: 550 }
    });
    expect(result.suggestions.some((s) => s.category === 'PSU')).toBe(true);
  });

  test('prioritizes compatibility fix', () => {
    const result = analyzeConfiguration({
      CPU: { socket: 'AM4', perf_score: 250 },
      MOTHERBOARD: { socket: 'LGA1700', perf_score: 180 }
    });
    expect(result.suggestions[0].category).toBe('COMPATIBILITY');
  });
});
