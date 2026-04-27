const { validateCompatibility } = require('../src/services/compatibilityService');

describe('validateCompatibility', () => {
  test('detects CPU socket mismatch', () => {
    const result = validateCompatibility({
      CPU: { socket: 'AM4', tdp: 65 },
      MOTHERBOARD: { socket: 'LGA1700' }
    });
    expect(result.compatible).toBe(false);
    expect(result.issues.some((x) => x.code === 'CPU_SOCKET_MISMATCH')).toBe(true);
  });

  test('accepts baseline compatible config', () => {
    const result = validateCompatibility({
      CPU: { socket: 'AM4', tdp: 65 },
      MOTHERBOARD: { socket: 'AM4', ram_type: 'DDR4', storage_interface: 'SATA/NVME' },
      RAM: { ram_type: 'DDR4' },
      GPU: { metadata_json: { recommendedPsu: 550 } },
      PSU: { wattage: 750 },
      STORAGE: { storage_interface: 'NVME' }
    });
    expect(result.compatible).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
