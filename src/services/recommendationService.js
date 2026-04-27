const { validateCompatibility } = require('./compatibilityService');

function perf(component) {
  return Number(component?.perf_score || 0);
}

function analyzeConfiguration(config) {
  const compatibility = validateCompatibility(config);
  const suggestions = [];

  const cpuPerf = perf(config.CPU);
  const gpuPerf = perf(config.GPU);

  if (cpuPerf && gpuPerf) {
    const ratio = gpuPerf / cpuPerf;
    if (ratio > 1.8) {
      suggestions.push({
        priority: 1,
        category: 'CPU',
        reason: 'CPU likely bottlenecks this GPU.',
        estimatedImprovementPercent: 20
      });
    }
    if (ratio < 0.6) {
      suggestions.push({
        priority: 2,
        category: 'GPU',
        reason: 'GPU is much weaker than CPU.',
        estimatedImprovementPercent: 25
      });
    }
  }

  if (config.PSU && config.GPU) {
    const meta = typeof config.GPU.metadata_json === 'string' ? JSON.parse(config.GPU.metadata_json) : (config.GPU.metadata_json || {});
    const need = Number(meta.recommendedPsu || 0);
    const have = Number(config.PSU.wattage || 0);
    if (need && have < need) {
      suggestions.push({
        priority: 1,
        category: 'PSU',
        reason: `PSU wattage ${have}W is below recommended ${need}W.`,
        estimatedImprovementPercent: 10
      });
    }
  }

  if (!compatibility.compatible) {
    suggestions.push({
      priority: 1,
      category: 'COMPATIBILITY',
      reason: 'Fix hard compatibility issues first.',
      estimatedImprovementPercent: 100
    });
  }

  suggestions.sort((a, b) => a.priority - b.priority || b.estimatedImprovementPercent - a.estimatedImprovementPercent);
  return {
    healthScore: Math.max(0, 100 - suggestions.length * 8),
    compatibility,
    suggestions
  };
}

module.exports = { analyzeConfiguration };
