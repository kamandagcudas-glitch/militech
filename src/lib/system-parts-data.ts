import type { SystemPart } from './types';

/**
 * Technical intelligence for the System Unit Showcase.
 * Calibrated for Unsplash photo-1587202376732-817926e93a17 (Full Internal Assembly)
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
    name: 'CPU (Central Processing Unit)',
    definition: 'The "brain" of the computer responsible for executing instructions and processing data.',
    purpose: 'To interpret and carry out the commands from the hardware and software.',
    howItWorks: 'It fetches instructions from RAM, decodes them into mathematical operations, and executes them billions of times per second (Clock Speed).',
    installation: [
      'Lift the retention lever on the motherboard socket.',
      'Align the CPU notch or triangle with the socket mark.',
      'Place it gently without force; it should drop in.',
      'Close the retention lever and apply thermal paste.'
    ],
    position: { top: '38%', left: '44%', width: '10%', height: '10%' },
  },
  {
    id: 'ram',
    name: 'RAM (Random Access Memory)',
    definition: 'A high-speed, volatile storage location for data the CPU needs to access quickly.',
    purpose: 'Stores active programs and data currently being processed by the system.',
    howItWorks: 'The CPU stores temporary data here instead of the slower hard drive, allowing for seamless multitasking and fast application response.',
    installation: [
      'Locate the DIMM slots on the motherboard.',
      'Push down the tabs at the ends of the slots.',
      'Align the notch on the RAM stick with the slot.',
      'Press down firmly until the clips lock into place.'
    ],
    position: { top: '38%', left: '58%', width: '6%', height: '18%' },
  },
  {
    id: 'gpu',
    name: 'GPU (Graphics Card)',
    definition: 'A specialized processor designed to handle complex mathematical and geometric calculations for graphics.',
    purpose: 'To render images, video, and 3D environments for display on a monitor.',
    howItWorks: 'It processes thousands of simultaneous threads to calculate pixel data, offloading heavy graphical tasks from the main CPU.',
    installation: [
      'Remove the expansion slot covers on the rear of the case.',
      'Align the GPU with the primary PCIe x16 slot.',
      'Press down until the lock clicks.',
      'Secure with screws and connect PCIe power cables.'
    ],
    position: { top: '62%', left: '52%', width: '40%', height: '12%' },
  },
  {
    id: 'psu',
    name: 'Power Supply Unit (PSU)',
    definition: 'The hardware component that converts AC electricity from the wall into DC power.',
    purpose: 'To provide stable and regulated voltage to all internal components.',
    howItWorks: 'It transforms high-voltage AC into lower-voltage DC (+3.3V, +5V, +12V) required by the motherboard and peripherals.',
    installation: [
      'Place the PSU into its bay (usually at the bottom).',
      'Secure it to the back of the case using four screws.',
      'Route cables through the cable management holes.',
      'Connect cables to the motherboard, GPU, and drives.'
    ],
    position: { top: '88%', left: '50%', width: '50%', height: '8%' },
  },
  {
    id: 'ssd',
    name: 'SSD (Solid State Drive)',
    definition: 'A non-volatile storage device that uses flash memory to store permanent data.',
    purpose: 'Stores the operating system, applications, and user files permanently.',
    howItWorks: 'Unlike HDDs, it has no moving parts. It uses electrical charges to store data, resulting in near-instant access and high durability.',
    installation: [
      'Locate the M.2 slot or 2.5-inch drive bay.',
      'For M.2: Slide in at an angle and secure with a tiny screw.',
      'For 2.5-inch: Mount in the bay and connect SATA data/power cables.',
      'Ensure it is recognized in the BIOS.'
    ],
    position: { top: '55%', left: '48%', width: '4%', height: '4%' },
  },
  {
    id: 'fans',
    name: 'Cooling Fans',
    definition: 'Mechanical devices used to move air throughout the computer case.',
    purpose: 'To maintain optimal operating temperatures by removing heat from components.',
    howItWorks: 'They create an airflow path, drawing cool air in through the front (intake) and pushing hot air out through the back (exhaust).',
    installation: [
      'Check the arrow on the fan frame for airflow direction.',
      'Mount the fan to the chassis using four screws.',
      'Connect the 3-pin or 4-pin PWM header to the motherboard.',
      'Configure fan curves in the BIOS for noise/temp balance.'
    ],
    position: { top: '42%', left: '22%', width: '8%', height: '12%' },
  },
  {
    id: 'cables',
    name: 'Internal Cabling',
    definition: 'The network of wires that transmit data and power between hardware.',
    purpose: 'To interconnect the PSU, motherboard, storage, and front-panel ports.',
    howItWorks: 'Copper wires within insulated jackets carry electrical signals or power from source to destination.',
    installation: [
      'Group similar cables together using zip ties.',
      'Route cables behind the motherboard tray to keep the air path clear.',
      'Ensure all connectors are fully seated and clicked in.',
      'Avoid tight bends that could damage internal wiring.'
    ],
    position: { top: '75%', left: '40%', width: '15%', height: '10%' },
  },
  {
    id: 'case',
    name: 'Chassis (Computer Case)',
    definition: 'The enclosure that contains and protects most of the components of a computer.',
    purpose: 'Provides physical support, shielding, and a managed environment for airflow.',
    howItWorks: 'It acts as a Faraday cage to block EMI and provides a structured layout for component mounting and cooling.',
    installation: [
      'Open side panels using thumbscrews.',
      'Install standoffs required for your motherboard size.',
      'Plan component placement for optimal cable management.',
      'Keep dust filters clean for better airflow longevity.'
    ],
    position: { top: '50%', left: '10%', width: '5%', height: '80%' },
  },
];