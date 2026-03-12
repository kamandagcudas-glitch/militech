import type { SystemPart } from './types';

/**
 * Technical intelligence for the System Unit Showcase.
 * Calibrated for Unsplash photo-1587202376732-817926e93a17 (Full System Unit)
 */
export const systemPartsData: SystemPart[] = [
  {
    id: 'case',
    name: 'Chassis (System Unit Case)',
    definition: 'The outer enclosure that houses and protects all internal computer components.',
    purpose: 'To provide structural support, electromagnetic interference (EMI) shielding, and directed cooling paths.',
    howItWorks: 'The case acts as a common ground for components and manages the thermal environment through organized airflow and internal compartmentalization.',
    installation: [
      'Remove side panels using captive thumbscrews.',
      'Identify and verify motherboard standoff placement.',
      'Plan component installation sequence (PSU first is recommended).',
      'Maintain dust filters regularly to ensure consistent airflow.'
    ],
    position: { top: '50%', left: '10%', width: '24px', height: '24px' },
  },
  {
    id: 'motherboard',
    name: 'Motherboard (Mainboard)',
    definition: 'The primary printed circuit board (PCB) that serves as the central hub of the system.',
    purpose: 'To provide communication channels (bus lines) between all hardware nodes and distribute power.',
    howItWorks: 'It uses copper traces to send data signals between the CPU, RAM, and PCIe devices while hosting the chipset that manages these flows.',
    installation: [
      'Install the I/O shield into the rear chassis cutout.',
      'Align the board with the brass standoffs.',
      'Secure using non-magnetic screws.',
      'Connect the 24-pin ATX and 8-pin CPU power headers.'
    ],
    position: { top: '45%', left: '45%', width: '24px', height: '24px' },
  },
  {
    id: 'cpu',
    name: 'CPU & Cooler (The Processor)',
    definition: 'The Central Processing Unit handles all logic and calculations, paired with a liquid or air cooling system.',
    purpose: 'To execute program instructions and maintain operational temperatures under heavy workloads.',
    howItWorks: 'The CPU processes binary instructions while the AIO (All-In-One) cooler pumps liquid through a radiator to dissipate heat.',
    installation: [
      'Lift the CPU socket lever and orient the chip correctly.',
      'Apply a pea-sized amount of thermal paste to the center.',
      'Mount the cooler block firmly over the CPU.',
      'Connect the pump header to the CPU_FAN or AIO_PUMP port.'
    ],
    position: { top: '35%', left: '48%', width: '24px', height: '24px' },
  },
  {
    id: 'ram',
    name: 'RAM (Random Access Memory)',
    definition: 'High-speed volatile memory used for short-term data storage.',
    purpose: 'Provides the CPU with near-instant access to active files and running programs.',
    howItWorks: 'Data is stored in electrical charges that can be accessed far faster than permanent storage, cleared once power is terminated.',
    installation: [
      'Locate the DIMM slots (usually to the right of the CPU).',
      'Open the retention clips at both ends.',
      'Align the key notch on the memory stick with the slot.',
      'Press firmly until both clips click into place.'
    ],
    position: { top: '35%', left: '62%', width: '24px', height: '24px' },
  },
  {
    id: 'gpu',
    name: 'GPU (Graphics Card)',
    definition: 'A dedicated hardware node for rendering 3D geometry and visual output.',
    purpose: 'Offloads visual processing from the CPU to provide high-resolution display and acceleration.',
    howItWorks: 'Uses thousands of specialized cores to process pixel data in parallel, transmitting the final frame to the display.',
    installation: [
      'Remove the necessary expansion slot covers from the rear.',
      'Insert the GPU into the primary PCIe x16 slot.',
      'Secure the bracket to the chassis with screws.',
      'Plug in all required PCIe power cables (6+2 pin).'
    ],
    position: { top: '58%', left: '50%', width: '24px', height: '24px' },
  },
  {
    id: 'psu',
    name: 'Power Supply Unit (PSU)',
    definition: 'The unit that converts high-voltage AC from the wall to stable DC power for the PC.',
    purpose: 'Distributes specific voltages (+12V, +5V, +33V) to every component in the simulation.',
    howItWorks: 'A transformer and regulator system converts external energy into the filtered, stable rails required by silicon components.',
    installation: [
      'Slide the PSU into the bottom basement shroud of the case.',
      'Secure with four screws to the rear panel.',
      'Route cables through the management grommets.',
      'Connect only the modular cables needed for the build.'
    ],
    position: { top: '85%', left: '40%', width: '24px', height: '24px' },
  },
  {
    id: 'ssd',
    name: 'M.2 NVMe SSD (Storage)',
    definition: 'A compact, non-volatile storage device using high-speed flash memory.',
    purpose: 'Permanently stores the operating system, applications, and user files with high read/write speeds.',
    howItWorks: 'Uses NAND flash cells to store data as electrical states, connected directly to the high-speed motherboard bus.',
    installation: [
      'Locate the M.2 slot on the motherboard (often under a heatsink).',
      'Insert the SSD at a 30-degree angle.',
      'Press the SSD flat and secure with the tiny mounting screw.',
      'Re-apply the thermal heatsink if provided.'
    ],
    position: { top: '72%', left: '60%', width: '24px', height: '24px' },
  },
  {
    id: 'fans',
    name: 'Chassis Fans',
    definition: 'Nodes used to manage internal thermal airflow.',
    purpose: 'Draws ambient cool air into the system and expels hot air generated by the CPU/GPU.',
    howItWorks: 'Creates a pressure differential that forces air through the chassis in a specific intake/exhaust pattern.',
    installation: [
      'Identify flow direction (marked by arrows on the fan frame).',
      'Mount fans to the front, top, or rear chassis rails.',
      'Connect headers to the SYS_FAN or fan controller node.',
      'Ensure cables are clear of the rotating blades.'
    ],
    position: { top: '40%', left: '20%', width: '24px', height: '24px' },
  },
  {
    id: 'cables',
    name: 'Internal Cabling',
    definition: 'The network of power and data lines connecting all nodes.',
    purpose: 'Transmits energy and control signals while maintaining a clean internal environment.',
    howItWorks: 'Organized routing improves airflow and prevents thermal pockets from forming around sensitive hardware.',
    installation: [
      'Thread all main power lines through to the rear cable tray.',
      'Connect the front-panel pins (Power, Reset, Activity LED).',
      'Use cable ties or velcro straps to bundle similar runs.',
      'Ensure side panels can close without placing stress on connectors.'
    ],
    position: { top: '70%', left: '30%', width: '24px', height: '24px' },
  },
];