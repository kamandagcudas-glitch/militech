import type { SystemPart } from './types';

/**
 * Data for the System Unit Parts Viewer.
 * Each part includes an ID, name, description, installation notes,
 * and its position on the main system unit image.
 * Positions are in percentages to allow for responsive scaling.
 */
export const systemPartsData: SystemPart[] = [
  {
    id: 'motherboard',
    name: 'Motherboard',
    description: 'The main printed circuit board (PCB) in a computer. It holds and allows communication between many of the crucial electronic components of a system, such as the CPU and memory.',
    installation: 'Carefully mounted into the case using standoffs to prevent short-circuiting. All other components, like the CPU, RAM, and GPU, connect directly to it.',
    position: { top: '10%', left: '25%', width: '50%', height: '80%' },
  },
  {
    id: 'cpu-cooler',
    name: 'CPU Cooler',
    description: 'A device that draws heat away from the CPU. It is essential for preventing the processor from overheating, which can cause damage or system instability.',
    installation: 'Mounted directly on top of the CPU with a layer of thermal paste in between to ensure efficient heat transfer. It is then secured to the motherboard.',
    position: { top: '30%', left: '42%', width: '18%', height: '22%' },
  },
  {
    id: 'cpu',
    name: 'CPU (Processor)',
    description: 'The Central Processing Unit, or the "brain" of the computer. It performs most of the processing inside a computer, carrying out the instructions of a computer program.',
    installation: 'Located underneath the large CPU cooler. It is carefully placed into the CPU socket on the motherboard, and a retention arm is lowered to secure it.',
    position: { top: '40%', left: '48%', width: '5%', height: '5%' },
  },
  {
    id: 'ram',
    name: 'RAM (Memory)',
    description: 'Random-Access Memory is the computer\'s short-term memory. It temporarily stores data that the CPU needs to access quickly. It is volatile, meaning it loses its content when the power is off.',
    installation: 'RAM sticks are inserted into the long, paired slots on the motherboard, typically to the right of the CPU. They click into place when pushed firmly.',
    position: { top: '22%', left: '55%', width: '20%', height: '15%' },
  },
  {
    id: 'gpu',
    name: 'Graphics Card (GPU)',
    description: 'A specialized electronic circuit designed to rapidly manipulate and alter memory to accelerate the creation of images in a frame buffer intended for output to a display device.',
    installation: 'Inserted into the top-most long PCIe slot on the motherboard. It\'s a large card that often requires its own power connectors from the PSU.',
    position: { top: '55%', left: '30%', width: '45%', height: '18%' },
  },
  {
    id: 'psu',
    name: 'Power Supply Unit (PSU)',
    description: 'Converts AC power from the wall outlet into the low-voltage regulated DC power needed by the internal components of a computer.',
    installation: 'Usually located at the bottom or top of the case. In this image, it is under the shroud at the bottom. Its cables connect to the motherboard, CPU, GPU, and storage drives.',
    position: { top: '80%', left: '10%', width: '80%', height: '18%' },
  },
  {
    id: 'storage',
    name: 'Storage (SSD/HDD)',
    description: 'The long-term memory of the computer. It stores the operating system, applications, and all of your personal files. SSDs (Solid State Drives) are much faster than traditional HDDs (Hard Disk Drives).',
    installation: 'Drives are mounted in bays or cages within the case. In modern cases, SSDs might be mounted on the back of the motherboard tray. They connect to the motherboard via a SATA data cable and to the PSU for power.',
    position: { top: '78%', left: '60%', width: '25%', height: '10%' },
  },
  {
    id: 'case-fan',
    name: 'Case Fans',
    description: 'Used to move air through the computer case. Proper airflow is critical for cooling all components and maintaining system stability.',
    installation: 'Screwed directly into the chassis at the front, back, top, or bottom of the case. They connect to fan headers on the motherboard for power and speed control.',
    position: { top: '25%', left: '85%', width: '12%', height: '20%' },
  },
];
