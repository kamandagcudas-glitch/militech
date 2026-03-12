import type { SystemPart } from './types';

/**
 * Data for the System Unit Parts Viewer.
 * Each part includes an ID, name, description, installation notes,
 * and its position on the main system unit image.
 * Positions calibrated for Unsplash photo-1591488320449-011701bb6704 (Full System Unit)
 */
export const systemPartsData: SystemPart[] = [
  {
    id: 'motherboard',
    name: 'Motherboard (Main Circuit Board)',
    description: 'The foundation of the PC. It houses the Chipset, which determines the features and compatibility of the system.',
    installation: 'Mount using brass standoffs to prevent electrical shorts. Snap the I/O shield into the case before installing the board.',
    position: { top: '45%', left: '42%', width: '40%', height: '40%' },
  },
  {
    id: 'cpu-cooler',
    name: 'CPU Liquid Cooler (AIO)',
    description: 'A high-performance liquid cooling system that dissipates heat from the CPU more efficiently than standard air coolers.',
    installation: 'Apply thermal paste to the CPU, then mount the pump block securely. Attach the radiator and fans to the chassis vents.',
    position: { top: '32%', left: '40%', width: '12%', height: '12%' },
  },
  {
    id: 'ram',
    name: 'RAM (RGB Memory)',
    description: 'High-speed Random Access Memory with RGB lighting. Stores data for active tasks and processes.',
    installation: 'Insert into the motherboard DIMM slots until the side clips click into place. Use slots 2 and 4 for dual-channel performance.',
    position: { top: '32%', left: '52%', width: '8%', height: '20%' },
  },
  {
    id: 'gpu',
    name: 'Graphics Card (GPU)',
    description: 'A dedicated hardware component for processing graphical data, essential for gaming and professional design.',
    installation: 'Insert into the primary PCIe x16 slot and secure with case screws. Connect the required 8-pin power cables from the PSU.',
    position: { top: '58%', left: '38%', width: '42%', height: '12%' },
  },
  {
    id: 'psu-shroud',
    name: 'Power Supply Unit (PSU) Shroud',
    description: 'The protective covering for the power supply unit, which converts AC power to DC for all internal components.',
    installation: 'The PSU is installed at the bottom of the case, usually behind this shroud to hide cable clutter and improve airflow.',
    position: { top: '82%', left: '45%', width: '50%', height: '10%' },
  },
  {
    id: 'case-fans',
    name: 'Intake & Exhaust Fans',
    description: 'Fans responsible for maintaining airflow through the chassis to prevent component overheating.',
    installation: 'Mount fans to the case frame. Ensure arrows on the fan frame point in the desired direction of airflow.',
    position: { top: '40%', left: '82%', width: '8%', height: '18%' },
  },
  {
    id: 'm2-ssd',
    name: 'NVMe M.2 SSD',
    description: 'Ultra-fast non-volatile storage that plugs directly into the motherboard, offering superior speed over traditional drives.',
    installation: 'Insert into the M.2 slot at a 30-degree angle and secure with the tiny mounting screw or a tool-less clip.',
    position: { top: '50%', left: '48%', width: '4%', height: '4%' },
  },
  {
    id: 'cmos-battery',
    name: 'CMOS Battery',
    description: 'A small coin-cell battery that provides power to the BIOS chip, preserving system settings and the clock.',
    installation: 'Slide into the circular battery holder on the motherboard. Replace if the system fails to remember the date or time.',
    position: { top: '72%', left: '45%', width: '3%', height: '3%' },
  },
];
