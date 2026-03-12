import type { SystemPart } from './types';

/**
 * Data for the System Unit Technical Showcase.
 * Positions precisely calibrated for Unsplash photo-1591488320449-011701bb6704 (High-detail full system unit)
 */
export const systemPartsData: SystemPart[] = [
  {
    id: 'motherboard',
    name: 'Motherboard (Main Circuit Board)',
    description: 'The backbone of the system. It hosts the chipset and manages high-speed communication between all components.',
    installation: 'Mount securely using brass standoffs. Ensure the I/O shield is snapped into the case first.',
    position: { top: '42%', left: '42%', width: '35%', height: '35%' },
  },
  {
    id: 'cpu-cooler',
    name: 'CPU Liquid Cooler (AIO Pump)',
    description: 'A closed-loop liquid cooling unit that draws heat away from the processor for maximum thermal stability.',
    installation: 'Ensure thermal paste is applied evenly. Tighten the pump block in a cross-pattern for even pressure.',
    position: { top: '38%', left: '44%', width: '10%', height: '10%' },
  },
  {
    id: 'ram',
    name: 'RAM (DDR5 Memory Modules)',
    description: 'High-speed memory used for temporary data storage. These sticks feature RGB heat spreaders for thermal management.',
    installation: 'Push into DIMM slots until the side tabs click. Use slots 2 and 4 for dual-channel efficiency.',
    position: { top: '38%', left: '58%', width: '6%', height: '18%' },
  },
  {
    id: 'gpu',
    name: 'Graphics Card (GPU)',
    description: 'A high-performance discrete graphics unit responsible for rendering 3D environments and video output.',
    installation: 'Insert into the primary PCIe x16 slot. Secure with chassis screws and connect 12VHPWR cables.',
    position: { top: '62%', left: '52%', width: '40%', height: '12%' },
  },
  {
    id: 'psu-shroud',
    name: 'Power Supply Unit (PSU) Shroud',
    description: 'Protective casing for the PSU. It isolates heat and hides cable clutter for improved airflow.',
    installation: 'The power supply is housed at the base of the chassis, drawing cool air from the bottom intake.',
    position: { top: '88%', left: '50%', width: '50%', height: '8%' },
  },
  {
    id: 'rear-fan',
    name: 'Exhaust Fan',
    description: 'Draws hot air out of the system unit to maintain a constant flow of cool air over the components.',
    installation: 'Mounted at the rear. Ensure the fan orientation is set to exhaust (pushing air out).',
    position: { top: '42%', left: '22%', width: '8%', height: '12%' },
  },
  {
    id: 'm2-ssd',
    name: 'NVMe M.2 SSD (Gen4)',
    description: 'Ultra-fast non-volatile storage module. It plugs directly into the motherboard via the M.2 interface.',
    installation: 'Slide into the slot at a 30-degree angle. Secure with the M.2 screw or tool-less latch.',
    position: { top: '55%', left: '48%', width: '4%', height: '4%' },
  },
  {
    id: 'cmos-battery',
    name: 'CMOS Battery',
    description: 'A CR2032 lithium battery that powers the BIOS memory chip, preserving system time and hardware settings.',
    installation: 'Located near the PCIe slots. Slide into the circular holder until it clicks under the metal tab.',
    position: { top: '72%', left: '48%', width: '3%', height: '3%' },
  },
];
