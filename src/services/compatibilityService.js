function parseMeta(component) {
  if (!component?.metadata_json) return {};
  return typeof component.metadata_json === 'string' ? JSON.parse(component.metadata_json) : component.metadata_json;
}

function validateCompatibility(config) {
  const issues = [];
  const cpu = config.CPU;
  const board = config.MOTHERBOARD;
  const ram = config.RAM;
  const gpu = config.GPU;
  const psu = config.PSU;
  const storage = config.STORAGE;
  const cooler = config.COOLER;

  if (cpu && board && cpu.socket && board.socket && cpu.socket !== board.socket) {
    issues.push({ severity: 'error', code: 'CPU_SOCKET_MISMATCH', message: 'CPU socket does not match motherboard socket.' });
  }
  if (ram && board && ram.ram_type && board.ram_type && ram.ram_type !== board.ram_type) {
    issues.push({ severity: 'error', code: 'RAM_TYPE_MISMATCH', message: 'RAM type is incompatible with motherboard.' });
  }
  if (gpu && psu) {
    const recommended = Number(parseMeta(gpu).recommendedPsu || 0);
    if (recommended && Number(psu.wattage || 0) < recommended) {
      issues.push({ severity: 'error', code: 'GPU_PSU_POWER', message: `GPU requires at least ${recommended}W PSU.` });
    }
  }
  if (storage && board && storage.storage_interface && board.storage_interface) {
    const supported = board.storage_interface.split('/');
    if (!supported.includes(storage.storage_interface)) {
      issues.push({ severity: 'error', code: 'STORAGE_INTERFACE_MISMATCH', message: 'Storage interface not supported by motherboard.' });
    }
  }
  if (cpu && cooler) {
    const maxTdp = Number(parseMeta(cooler).maxTdp || 0);
    if (maxTdp && Number(cpu.tdp || 0) > maxTdp) {
      issues.push({ severity: 'warning', code: 'COOLER_THERMAL_LIMIT', message: 'Cooler may not be enough for CPU thermal load.' });
    }
  }

  return {
    compatible: issues.every((x) => x.severity !== 'error'),
    issues
  };
}

module.exports = { validateCompatibility };
