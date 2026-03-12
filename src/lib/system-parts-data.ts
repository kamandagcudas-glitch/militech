
import type { SystemPart } from './types';

/**
 * Technical intelligence for the System Unit Showcase.
 * Calibrated for Unsplash photo-1591488320449-011701bb6704 (Full System Unit)
 */
export const systemPartsData: SystemPart[] = [
  {
    id: 'case',
    name: 'Chassis (System Unit Case)',
    definition: 'The outer enclosure that houses and protects all internal computer components.',
    purpose: 'To provide structural support, electromagnetic interference (EMI) shielding, and directed cooling paths.',
    howItWorks: 'The case acts as a common ground for components and manages the thermal environment through organized airflow.',
    installation: [
      'Remove side panels using captive thumbscrews.',
      'Identify motherboard standoff placement.',
      'Plan component installation sequence.',
      'Maintain dust filters regularly.'
    ],
    position: { top: '50%', left: '10%', width: '24px', height: '24px' },
    imageId: 'gaming-case'
  },
  {
    id: 'motherboard',
    name: 'Motherboard (Mainboard)',
    definition: 'The primary printed circuit board (PCB) that serves as the central hub of the system.',
    purpose: 'To provide communication channels (bus lines) between all hardware nodes.',
    howItWorks: 'It uses copper traces to send data signals between the CPU, RAM, and PCIe devices.',
    installation: [
      'Install the I/O shield into the rear chassis cutout.',
      'Align the board with the brass standoffs.',
      'Secure using non-magnetic screws.',
      'Connect the main 24-pin power header.'
    ],
    position: { top: '45%', left: '40%', width: '24px', height: '24px' },
    imageId: 'gaming-motherboard'
  },
  {
    id: 'cpu',
    name: 'CPU & Cooler (Processor)',
    definition: 'The Central Processing Unit handles all logic and calculations, paired with a cooling solution.',
    purpose: 'To execute program instructions and maintain operational temperatures.',
    howItWorks: 'The CPU processes binary instructions while the cooler dissipates heat via liquid or air.',
    installation: [
      'Lift the CPU socket lever and orient the chip correctly.',
      'Apply thermal paste to the center.',
      'Mount the cooler firmly over the CPU.',
      'Connect the fan header to the CPU_FAN port.'
    ],
    position: { top: '32%', left: '42%', width: '24px', height: '24px' },
    imageId: 'gaming-cpu'
  },
  {
    id: 'ram',
    name: 'RAM (Random Access Memory)',
    definition: 'High-speed volatile memory used for short-term data storage.',
    purpose: 'Provides the CPU with near-instant access to active files and programs.',
    howItWorks: 'Data is stored in electrical charges that are cleared once power is terminated.',
    installation: [
      'Locate the DIMM slots (usually to the right of the CPU).',
      'Open the retention clips at both ends.',
      'Align the key notch on the memory stick.',
      'Press firmly until clips click into place.'
    ],
    position: { top: '35%', left: '55%', width: '24px', height: '24px' },
    imageId: 'gaming-ram'
  },
  {
    id: 'gpu',
    name: 'GPU (Graphics Card)',
    definition: 'A dedicated hardware node for rendering 3D geometry and visual output.',
    purpose: 'Offloads visual processing from the CPU for high-resolution display.',
    howItWorks: 'Uses thousands of specialized cores to process pixel data in parallel.',
    installation: [
      'Remove expansion slot covers from the chassis rear.',
      'Insert the GPU into the primary PCIe x16 slot.',
      'Secure the bracket with screws.',
      'Plug in required PCIe power cables.'
    ],
    position: { top: '58%', left: '45%', width: '24px', height: '24px' },
    imageId: 'gaming-gpu'
  },
  {
    id: 'psu',
    name: 'Power Supply Unit (PSU)',
    definition: 'The unit that converts high-voltage AC from the wall to stable DC power.',
    purpose: 'Distributes specific voltages to every component in the system.',
    howItWorks: 'A transformer system converts external energy into the filtered rails required by silicon parts.',
    installation: [
      'Slide the PSU into the bottom basement shroud.',
      'Secure with four screws to the rear panel.',
      'Route cables through management grommets.',
      'Connect only the modular cables needed.'
    ],
    position: { top: '85%', left: '35%', width: '24px', height: '24px' },
    imageId: 'gaming-psu'
  },
  {
    id: 'ssd',
    name: 'M.2 NVMe SSD (Storage)',
    definition: 'A compact, non-volatile storage device using high-speed flash memory.',
    purpose: 'Permanently stores the OS, applications, and user files.',
    howItWorks: 'Uses NAND flash cells to store data as electrical states.',
    installation: [
      'Locate the M.2 slot on the motherboard.',
      'Insert the SSD at a 30-degree angle.',
      'Press the SSD flat and secure with the mounting screw.',
      'Re-apply the thermal heatsink if provided.'
    ],
    position: { top: '72%', left: '55%', width: '24px', height: '24px' },
    imageId: 'gaming-storage'
  },
  {
    id: 'fans',
    name: 'Chassis Fans',
    definition: 'Nodes used to manage internal thermal airflow.',
    purpose: 'Draws ambient cool air in and expels hot air out.',
    howItWorks: 'Creates a pressure differential that forces air through the chassis.',
    installation: [
      'Identify flow direction marked by arrows.',
      'Mount fans to the front, top, or rear rails.',
      'Connect headers to SYS_FAN ports.',
      'Ensure cables are clear of blades.'
    ],
    position: { top: '40%', left: '15%', width: '24px', height: '24px' },
    imageId: 'system-fans'
  },
  {
    id: 'cables',
    name: 'Internal Cabling',
    definition: 'The network of power and data lines connecting all hardware.',
    purpose: 'Transmits energy and control signals while maintaining organization.',
    howItWorks: 'Organized routing prevents thermal pockets and improves airflow.',
    installation: [
      'Thread main power lines through to the rear tray.',
      'Connect front-panel pins (Power, Reset, Activity LED).',
      'Use cable ties to bundle similar runs.',
      'Ensure side panels can close without stress.'
    ],
    position: { top: '70%', left: '25%', width: '24px', height: '24px' },
    imageId: 'system-cables'
  },
];
