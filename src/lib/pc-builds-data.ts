import type { PcBuild } from './types';

export const pcBuildsData: PcBuild[] = [
  {
    id: 'gaming',
    name: 'Gaming Build',
    description: 'A high-end build focused on maximum performance for the latest AAA games at high resolutions and frame rates.',
    parts: {
      CPU: {
        name: 'Intel Core i9-14900K',
        description: 'The flagship processor for gaming, offering the highest clock speeds and top-tier performance to prevent any bottlenecks.',
        imageId: 'gaming-cpu',
        price: 589.00,
      },
      GPU: {
        name: 'NVIDIA GeForce RTX 4090',
        description: 'The most powerful consumer graphics card available, capable of handling 4K gaming with ray tracing at ultra settings.',
        imageId: 'gaming-gpu',
        price: 1799.99,
      },
      RAM: {
        name: '32GB DDR5 6000MHz',
        description: 'High-speed DDR5 memory ensures smooth gameplay and multitasking capabilities without any stutters.',
        imageId: 'gaming-ram',
        price: 114.99,
      },
      Storage: {
        name: '2TB NVMe Gen4 SSD',
        description: 'An ultra-fast solid-state drive for lightning-quick game load times and a responsive operating system.',
        imageId: 'gaming-storage',
        price: 129.99,
      },
      Motherboard: {
        name: 'Z790 Chipset Motherboard',
        description: 'A feature-rich motherboard with support for the latest CPU, DDR5 RAM, and ample connectivity for all your components.',
        imageId: 'gaming-motherboard',
        price: 249.99,
      },
      'Power Supply': {
        name: '1000W 80+ Gold PSU',
        description: 'A high-wattage, efficient power supply to provide stable and reliable power to the power-hungry components.',
        imageId: 'gaming-psu',
        price: 169.99,
      },
      Case: {
        name: 'High-Airflow ATX Case',
        description: 'A spacious case with excellent cooling potential to keep your high-end components running at optimal temperatures.',
        imageId: 'gaming-case',
        price: 159.99,
      },
    },
  },
  {
    id: 'working',
    name: 'Working Build',
    description: 'A balanced and reliable build designed for productivity, multitasking, and professional applications like video editing and 3D rendering.',
    parts: {
      CPU: {
        name: 'AMD Ryzen 9 7900X',
        description: 'A powerful CPU with a high core count, perfect for handling demanding creative workloads and heavy multitasking.',
        imageId: 'working-cpu',
        price: 449.00,
      },
      GPU: {
        name: 'NVIDIA GeForce RTX 4070',
        description: 'A great all-around GPU that provides excellent performance in creative applications and is also very capable for high-end gaming.',
        imageId: 'working-gpu',
        price: 549.99,
      },
      RAM: {
        name: '64GB DDR5 5200MHz',
        description: 'A large amount of RAM is crucial for video editing and other memory-intensive productivity tasks.',
        imageId: 'working-ram',
        price: 189.99,
      },
      Storage: {
        name: '1TB NVMe Gen4 SSD + 4TB HDD',
        description: 'A dual-drive setup with a fast SSD for the OS and applications, and a large HDD for mass storage of project files and media.',
        imageId: 'working-storage',
        price: 179.99,
      },
      Motherboard: {
        name: 'B650 Chipset Motherboard',
        description: 'A reliable motherboard with solid features, providing a stable foundation for a productivity-focused workstation.',
        imageId: 'working-motherboard',
        price: 199.99,
      },
      'Power Supply': {
        name: '850W 80+ Gold PSU',
        description: 'An efficient and reliable power supply with enough wattage to handle the system under full load during intensive tasks.',
        imageId: 'working-psu',
        price: 129.99,
      },
      Case: {
        name: 'Minimalist ATX Case',
        description: 'A clean, professional-looking case with good airflow and sound-dampening features for a quiet work environment.',
        imageId: 'working-case',
        price: 109.99,
      },
    },
  },
  {
    id: 'coding',
    name: 'Coding Build',
    description: 'An efficient and cost-effective build optimized for software development, compilation, and running multiple virtual machines.',
    parts: {
      CPU: {
        name: 'AMD Ryzen 7 7700X',
        description: 'An excellent CPU with a great balance of core count and high single-core performance, ideal for compiling code and general responsiveness.',
        imageId: 'coding-cpu',
        price: 329.00,
      },
      GPU: {
        name: 'NVIDIA GeForce RTX 3050',
        description: 'A modest GPU that is more than enough for driving multiple high-resolution monitors and provides some GPU acceleration if needed. Not for high end gaming.',
        imageId: 'coding-gpu',
        price: 229.99,
      },
      RAM: {
        name: '32GB DDR5 5600MHz',
        description: 'Ample RAM for running IDEs, containers (like Docker), and virtual machines without slowing down.',
        imageId: 'coding-ram',
        price: 99.99,
      },
      Storage: {
        name: '1TB NVMe Gen4 SSD',
        description: 'A fast SSD is essential for a snappy development experience, with quick project loading, file searching, and compilation times.',
        imageId: 'coding-storage',
        price: 79.99,
      },
      Motherboard: {
        name: 'B650M mATX Motherboard',
        description: 'A solid, no-frills motherboard that provides all the necessary features for a development machine in a smaller form factor.',
        imageId: 'coding-motherboard',
        price: 139.99,
      },
      'Power Supply': {
        name: '650W 80+ Bronze PSU',
        description: 'A reliable power supply with sufficient wattage for the components, focusing on stability and efficiency.',
        imageId: 'coding-psu',
        price: 69.99,
      },
      Case: {
        name: 'Compact mATX Case',
        description: 'A simple, compact case that saves desk space while providing adequate cooling for a development workload.',
        imageId: 'coding-case',
        price: 79.99,
      },
    },
  },
];
