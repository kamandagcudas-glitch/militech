import type { SystemPart } from './types';

/**
 * Technical intelligence for the System Unit Showcase.
 * Calibrated for Unsplash photo-1591488320449-011701bb6704 (Full System Assembly)
 */
export const systemPartsData: SystemPart[] = [
  {
    id: 'motherboard',
    name: 'Motherboard (Main Circuit Board)',
    definition: 'The primary printed circuit board (PCB) that serves as the foundation of the computer.',
    purpose: 'To provide communication between all internal hardware components and distribute power.',
    howItWorks: 'It uses copper traces (bus lines) to send data signals between the CPU, RAM, and other components, while hosting the chipset that manages these data flows.',
    installation: [
      'Install the I/O shield into the back of the case.',
      'Align the motherboard with the brass standoffs in the case.',
      'Secure the board using screws, ensuring it does not touch the metal chassis directly.',
      'Connect the 24-pin ATX and 8-pin CPU power cables.'
    ],
    position: { top: '45%', left: '45%', width: '30%', height: '30%' },
  },
  {
    id: 'cpu',
    name: 'CPU & Cooling (Central Processing Unit)',
    definition: 'The "brain" of the computer responsible for executing instructions, paired with a thermal management system.',
    purpose: 'To carry out commands and maintain safe operating temperatures under load.',
    howItWorks: 'The CPU processes data while the Liquid Cooler uses a pump and radiator to dissipate heat from the CPU lid.',
    installation: [
      'Place the CPU in the motherboard socket carefully.',
      'Apply a small amount of thermal paste to the center of the CPU.',
      'Mount the cooler pump or heatsink firmly over the CPU.',
      'Connect the pump/fan header to the CPU_FAN port.'
    ],
    position: { top: '35%', left: '48%', width: '10%', height: '10%' },
  },
  {
    id: 'ram',
    name: 'RAM (Random Access Memory)',
    definition: 'High-speed volatile memory used for short-term data storage.',
    purpose: 'Provides the CPU with near-instant access to files and programs currently in use.',
    howItWorks: 'Stores data in electrical charges that can be read and written much faster than permanent storage, cleared once power is lost.',
    installation: [
      'Locate the DIMM slots (usually right of the CPU).',
      'Open the retention clips at the ends of the slots.',
      'Align the notch on the memory stick with the slot.',
      'Press down until the clips click into place.'
    ],
    position: { top: '35%', left: '62%', width: '6%', height: '18%' },
  },
  {
    id: 'gpu',
    name: 'GPU (Graphics Card)',
    definition: 'A dedicated hardware unit for rendering visual data and 3D geometry.',
    purpose: 'Offloads graphical processing from the CPU to provide high-fidelity visuals.',
    howItWorks: 'Uses thousands of small cores to process pixel data in parallel, sending the resulting image to the monitor.',
    installation: [
      'Remove expansion covers on the case rear.',
      'Insert the GPU into the top-most PCIe x16 slot.',
      'Secure the bracket with screws to the chassis.',
      'Connect the 6+2 pin PCIe power cables from the PSU.'
    ],
    position: { top: '58%', left: '50%', width: '40%', height: '12%' },
  },
  {
    id: 'psu',
    name: 'Power Supply Unit (PSU)',
    definition: 'The unit that converts wall AC to internal component DC power.',
    purpose: 'Distributes stable voltage to the motherboard, GPU, and other nodes.',
    howItWorks: 'A transformer and regulator system converts 110V/220V AC into +12V, +5V, and +3.3V DC rails.',
    installation: [
      'Place the PSU in the bottom basement shroud.',
      'Secure it with four screws to the rear of the case.',
      'Route cables through the rear management holes.',
      'Plug in all required modular or fixed cables.'
    ],
    position: { top: '85%', left: '40%', width: '50%', height: '8%' },
  },
  {
    id: 'ssd',
    name: 'M.2 SSD (Storage)',
    definition: 'A compact, non-volatile storage device using flash memory.',
    purpose: 'Stores the OS and files permanently with extremely high read/write speeds.',
    howItWorks: 'Uses NAND flash cells to store data as electrical states, connected directly to the motherboard bus.',
    installation: [
      'Locate the M.2 slot on the motherboard.',
      'Remove the thermal heatsink if present.',
      'Slide the SSD in at a 30-degree angle.',
      'Secure with the mounting screw and replace heatsink.'
    ],
    position: { top: '72%', left: '60%', width: '4%', height: '4%' },
  },
  {
    id: 'fans',
    name: 'Chassis Fans',
    definition: 'Fans used to manage internal airflow within the chassis.',
    purpose: 'Draws cool air in and pushes hot air out to prevent hardware throttling.',
    howItWorks: 'Creates a pressure differential that forces air through the case in a designated direction.',
    installation: [
      'Identify the intake and exhaust directions (arrows on frame).',
      'Screw fans onto the front, top, or rear chassis rails.',
      'Plug headers into SYS_FAN or a fan controller.',
      'Ensure cables do not obstruct the fan blades.'
    ],
    position: { top: '40%', left: '20%', width: '8%', height: '12%' },
  },
  {
    id: 'cables',
    name: 'Cable Management',
    definition: 'The organized routing of power and data lines.',
    purpose: 'Improves airflow and makes the system easier to service.',
    howItWorks: 'Uses channels, grommets, and zip-ties to keep the main chamber clear of obstruction.',
    installation: [
      'Pull all main power cables through to the rear tray.',
      'Connect front-panel headers (Power, Reset, Audio).',
      'Use velcro straps to group similar cable runs.',
      'Ensure side panels close without excessive force.'
    ],
    position: { top: '70%', left: '30%', width: '15%', height: '10%' },
  },
  {
    id: 'case',
    name: 'Chassis (System Unit Case)',
    definition: 'The enclosure that houses and protects all computer parts.',
    purpose: 'Provides structural support, shielding, and cooling paths.',
    howItWorks: 'Acts as a ground for components and manages the thermal environment through its internal layout.',
    installation: [
      'Remove side panels using captive thumbscrews.',
      'Ensure motherboard standoffs are installed correctly.',
      'Plan the component installation order (PSU first is common).',
      'Clean dust filters regularly to maintain airflow.'
    ],
    position: { top: '50%', left: '10%', width: '5%', height: '80%' },
  },
];
