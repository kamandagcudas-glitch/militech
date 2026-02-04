import type { COC, MiniGameRound, Achievement } from './types';

export const cocData: COC[] = [
  {
    id: 'coc1',
    title: 'COC 1: Install and Configure Computer Systems',
    description: 'Learn the basics of computer hardware, assembly, and operating system installation.',
    steps: [
      {
        id: 'step1',
        title: 'Dismantle & Assemble PC',
        lesson: {
          imageId: 'coc1-step1',
          text: [
            "Start by laying the case on its side. Open it up and identify the motherboard, CPU, RAM slots, and storage bays.",
            "Install the CPU on the motherboard, being careful with the pins. Then, clip in the RAM sticks.",
            "Mount the motherboard into the case. Install the power supply unit (PSU) and connect the main power cables.",
            "Finally, install the graphics card (if any) and storage drives (SSD/HDD). Close the case."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What is the brain of the computer? (Q${i+1})`,
          options: ['RAM', 'CPU', 'GPU', 'PSU'],
          correctAnswer: 'CPU',
          explanation: 'The CPU (Central Processing Unit) performs most of the processing inside a computer.',
        })),
      },
      {
        id: 'step2',
        title: 'Configure BIOS',
        lesson: {
          imageId: 'coc1-step2',
          text: [
            "Power on the PC and press the designated key (e.g., DEL, F2, F10) to enter the BIOS/UEFI setup.",
            "Set the correct date and time. Check if all components (CPU, RAM, drives) are recognized.",
            "Set the boot order. To install an OS from a USB, make the USB drive the first boot device.",
            "Save changes and exit."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What setting determines which drive to load the OS from? (Q${i+1})`,
          options: ['Boot Order', 'System Time', 'CPU Clock Speed', 'Fan Speed'],
          correctAnswer: 'Boot Order',
          explanation: 'The boot order or boot priority tells the computer which device to check for an operating system first.',
        })),
      },
      {
        id: 'step3',
        title: 'Create Bootable Device',
        lesson: {
          imageId: 'coc1-step3',
          text: [
            "Download a tool like Rufus and the ISO file for your desired operating system (e.g., Windows 10, Ubuntu).",
            "Insert a USB flash drive (at least 8GB). Open Rufus.",
            "Select your USB drive, then select the downloaded ISO file.",
            "Choose the correct partition scheme (usually GPT for modern systems). Click START and wait for it to finish."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What file format is used for an operating system installation disk image? (Q${i+1})`,
          options: ['JPG', 'DOC', 'ISO', 'EXE'],
          correctAnswer: 'ISO',
          explanation: 'An ISO file is an archive file that contains an identical copy (or image) of data from an optical disc.',
        })),
      },
      {
        id: 'step4',
        title: 'Install Operating System',
        lesson: {
          imageId: 'coc1-step4',
          text: [
            "Insert the bootable USB drive into the new PC and turn it on. It should boot from the USB.",
            "Follow the on-screen instructions to select language, time, and keyboard preferences.",
            "Choose 'Custom Install' to select the drive where you want to install the OS. You may need to format the drive.",
            "The installation process will copy files and restart several times. Complete the initial user setup."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Which installation type gives you more control over partitions? (Q${i+1})`,
          options: ['Express', 'Typical', 'Upgrade', 'Custom'],
          correctAnswer: 'Custom',
          explanation: 'Custom or Advanced installation allows you to manage partitions, which is necessary for a clean install.',
        })),
      },
      {
        id: 'step5',
        title: 'Install Device Drivers',
        lesson: {
          imageId: 'coc1-step5',
          text: [
            "After the OS is installed, some hardware may not work correctly. These need drivers.",
            "Go to the motherboard manufacturer's website and download the latest drivers for Chipset, LAN, Audio, and USB.",
            "If you have a dedicated graphics card, go to the NVIDIA or AMD website for the latest GPU drivers.",
            "Install each driver and restart the computer as prompted. Check Device Manager to ensure there are no unknown devices."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Where can you check for missing drivers in Windows? (Q${i+1})`,
          options: ['Control Panel', 'Device Manager', 'Task Manager', 'File Explorer'],
          correctAnswer: 'Device Manager',
          explanation: 'Device Manager shows all hardware connected to your computer and indicates if drivers are missing or have problems.',
        })),
      },
    ],
  },
  {
    id: 'coc2',
    title: 'COC 2: Set-up Computer Networks',
    description: 'Master network cabling, configuration, and setting up wireless access for small networks.',
    steps: [
       {
        id: 'step1',
        title: 'Types of Cables',
        lesson: {
          imageId: 'coc2-step1',
          text: [
            "The most common network cable is the Unshielded Twisted Pair (UTP), like Cat5e and Cat6.",
            "Coaxial cables are used for cable internet and TV. Fiber optic cables use light for extremely fast connections over long distances.",
            "Straight-through cables connect different types of devices (e.g., PC to switch). Crossover cables connect similar devices (e.g., PC to PC)."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Which cable type connects a PC to a switch? (Q${i+1})`,
          options: ['Crossover', 'Straight-through', 'Coaxial', 'Fiber Optic'],
          correctAnswer: 'Straight-through',
          explanation: 'Straight-through cables are used to connect devices that are not alike, such as a computer to a switch or hub.',
        })),
      },
      {
        id: 'step2',
        title: 'Crimp Straight & Crossover Cables',
        lesson: {
          imageId: 'coc2-step2',
          text: [
            "You need a UTP cable, RJ-45 connectors, and a crimping tool.",
            "For a straight-through cable (T-568B standard on both ends): Orange/White, Orange, Green/White, Blue, Blue/White, Green, Brown/White, Brown.",
            "For a crossover cable, one end is T-568B and the other is T-568A (Green/White, Green, Orange/White, Blue, Blue/White, Orange, Brown/White, Brown).",
            "Arrange the wires, flatten them, insert into the RJ-45 connector, and crimp firmly. Use a cable tester to verify."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Which standard is used for one end of a crossover cable? (Q${i+1})`,
          options: ['T-568A', 'RJ-45', 'UTP', 'Cat6'],
          correctAnswer: 'T-568A',
          explanation: 'A crossover cable typically has one end wired to the T-568A standard and the other to the T-568B standard.',
        })),
      },
       {
        id: 'step3',
        title: 'Network Configuration',
        lesson: {
          imageId: 'coc2-step3',
          text: [
            "On Windows, go to Network & Internet settings. You can set a static IP address or use DHCP.",
            "An IP address (e.g., 192.168.1.100) uniquely identifies a device. A Subnet Mask (e.g., 255.255.255.0) defines the local network size.",
            "The Default Gateway (e.g., 192.168.1.1) is the router's address. The DNS Server (e.g., 8.8.8.8) translates domain names to IP addresses."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What does DHCP stand for? (Q${i+1})`,
          options: ['Dynamic Host Configuration Protocol', 'Data Host Control Protocol', 'Dynamic Hyperlink Control Protocol', 'Data Hyperlink Configuration Protocol'],
          correctAnswer: 'Dynamic Host Configuration Protocol',
          explanation: 'DHCP is a network management protocol used to automate the process of configuring devices on IP networks.',
        })),
      },
       {
        id: 'step4',
        title: 'Setup Router, WiFi, and WAP',
        lesson: {
          imageId: 'coc2-step4',
          text: [
            "Connect the router to your modem and a PC. Access the router's admin page via its IP address (e.g., 192.168.1.1).",
            "Change the default admin password. Set up the WAN (internet) connection, usually via DHCP from your ISP.",
            "Configure the wireless network: set a strong SSID (network name) and a WPA2/WPA3 password.",
            "A Wireless Access Point (WAP) can be used to extend the Wi-Fi coverage of an existing network."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What is the name of a wireless network called? (Q${i+1})`,
          options: ['IP Address', 'MAC Address', 'SSID', 'WPA2'],
          correctAnswer: 'SSID',
          explanation: 'The SSID (Service Set Identifier) is the public name of a Wi-Fi network.',
        })),
      },
       {
        id: 'step5',
        title: 'Inspect and Test Network',
        lesson: {
          imageId: 'coc2-step5',
          text: [
            "Use the 'ping' command in the command prompt to test connectivity. Example: 'ping google.com' or 'ping 192.168.1.1'.",
            "'ipconfig' (Windows) or 'ifconfig' (Linux/macOS) shows your current IP configuration.",
            "'tracert' or 'traceroute' shows the path your data packets take to reach a destination.",
            "Ensure all devices on the network can communicate with each other and access the internet."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Which command tests connectivity to another device? (Q${i+1})`,
          options: ['ipconfig', 'tracert', 'netstat', 'ping'],
          correctAnswer: 'ping',
          explanation: 'The ping command sends a small packet of data to a specified IP address and waits for a reply to measure latency and packet loss.',
        })),
      },
    ]
  },
  {
    id: 'coc3',
    title: 'COC 3: Set-up Computer Servers',
    description: 'Configure server roles and manage network services like DHCP, DNS, and remote access.',
    steps: [
      {
        id: 'step1',
        title: 'Server-Client Setup & Roles',
        lesson: {
          imageId: 'coc3-step1',
          text: [
            "Install a server OS like Windows Server. In Server Manager, you can add roles and features.",
            "DHCP Server: Automatically assigns IP addresses to clients on the network.",
            "DNS Server: Manages a local database of domain names and their corresponding IP addresses.",
            "File Services: Allows you to create shared folders that clients can access over the network."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Which server role translates names like 'google.com' to IP addresses? (Q${i+1})`,
          options: ['DHCP', 'DNS', 'File Server', 'Web Server'],
          correctAnswer: 'DNS',
          explanation: 'The Domain Name System (DNS) is the phonebook of the Internet, translating human-readable domain names to machine-readable IP addresses.',
        })),
      },
      {
        id: 'step2',
        title: 'Remote Desktop & Printer Management',
        lesson: {
          imageId: 'coc3-step2',
          text: [
            "Enable Remote Desktop on the server to allow administrators to manage it from another computer.",
            "On a client PC, use the Remote Desktop Connection app to log into the server.",
            "For printer management, you can install a printer directly on the server and share it across the network.",
            "Clients can then add the shared network printer to their own devices."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What feature allows you to control a server from another PC? (Q${i+1})`,
          options: ['Remote Desktop', 'File Sharing', 'DHCP', 'DNS'],
          correctAnswer: 'Remote Desktop',
          explanation: 'Remote Desktop Protocol (RDP) provides a user with a graphical interface to connect to another computer over a network connection.',
        })),
      },
    ],
  },
  {
    id: 'coc4',
    title: 'COC 4: Maintain and Repair Computer Systems',
    description: 'Learn essential maintenance tasks to keep computer systems running smoothly and securely.',
    steps: [
      {
        id: 'step1',
        title: 'Performing Backups',
        lesson: {
          imageId: 'coc4-step1',
          text: [
            "Regular backups are crucial to prevent data loss. The 3-2-1 rule is a good practice: 3 copies of your data, on 2 different media, with 1 copy off-site.",
            "Windows has a built-in 'Backup and Restore' feature. You can create a system image (a full copy of your system drive) or back up specific files and folders.",
            "Schedule backups to run automatically to an external hard drive or a network location."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What is the 3-2-1 rule for? (Q${i+1})`,
          options: ['Networking', 'Backups', 'Security', 'Programming'],
          correctAnswer: 'Backups',
          explanation: 'The 3-2-1 backup strategy is a best practice for ensuring your data is safe from loss.',
        })),
      },
      {
        id: 'step2',
        title: 'Create System Restore Point',
        lesson: {
          imageId: 'coc4-step2',
          text: [
            "A restore point is a snapshot of your system files and settings. It's useful for undoing changes that cause problems.",
            "Go to System Properties > System Protection. Select your system drive (usually C:) and click 'Configure' to enable protection.",
            "Click 'Create' to manually create a restore point before installing new software or drivers.",
            "If something goes wrong, you can use System Restore to revert your PC to that earlier point in time."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `A restore point primarily saves... (Q${i+1})`,
          options: ['Personal files', 'System files and settings', 'Browser history', 'Emails'],
          correctAnswer: 'System files and settings',
          explanation: 'System Restore does not affect your personal documents, photos, or emails. It focuses on Windows system files, installed programs, and registry settings.',
        })),
      },
      {
        id: 'step3',
        title: 'Disk Cleanup and Defragmentation',
        lesson: {
          imageId: 'coc4-step3',
          text: [
            "Disk Cleanup is a utility that removes temporary files, system error memory dumps, and other unnecessary files to free up space.",
            "Disk Defragmenter (or Optimize Drives) reorganizes fragmented data on a hard disk drive (HDD) so it can work more efficiently. ",
            "On Solid State Drives (SSDs), this process is called TRIM and is usually handled automatically. You shouldn't defragment an SSD.",
            "Run these tools periodically to maintain system performance."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `Should you defragment an SSD? (Q${i+1})`,
          options: ['Yes, weekly', 'Yes, monthly', 'No', 'Only if it is full'],
          correctAnswer: 'No',
          explanation: 'Defragmenting an SSD is unnecessary and can reduce its lifespan. SSDs use a different technology (TRIM) to manage file storage efficiently.',
        })),
      },
      {
        id: 'step4',
        title: 'Virus Scanning and General Maintenance',
        lesson: {
          imageId: 'coc4-step4',
          text: [
            "Use a reputable antivirus program (like Windows Defender) and keep it updated.",
            "Run full system scans regularly to check for malware, viruses, and other threats.",
            "Keep your operating system and all software up-to-date to patch security vulnerabilities.",
            "Physically clean your computer: dust out fans and vents to ensure proper cooling and prevent overheating."
          ],
        },
        quiz: Array(20).fill(0).map((_, i) => ({
          question: `What is a primary reason to keep software updated? (Q${i+1})`,
          options: ['To get new features', 'To patch security vulnerabilities', 'To free up disk space', 'To improve boot time'],
          correctAnswer: 'To patch security vulnerabilities',
          explanation: 'Software updates often include critical security patches that protect your system from known threats.',
        })),
      },
    ],
  },
];

export const achievementsData: Achievement[] = [
    { id: 'coc1-complete', name: 'COC 1 Journeyman', description: 'Completed all steps in COC 1.', type: 'badge' },
    { id: 'coc2-complete', name: 'COC 2 Networker', description: 'Completed all steps in COC 2.', type: 'badge' },
    { id: 'coc3-complete', name: 'COC 3 Server Admin', description: 'Completed all steps in COC 3.', type: 'badge' },
    { id: 'coc4-complete', name: 'COC 4 Maintainer', description: 'Completed all steps in COC 4.', type: 'badge' },
    { id: 'minigame-complete', name: 'Word Wizard', description: 'Completed the 4 Pics 1 Word mini-game.', type: 'badge' },
    { id: 'creator', name: 'CREATOR', description: 'The mind behind the machine.', type: 'title' },
    { id: 'greatest-reset', name: 'The Greatest Reset', description: 'You have failed... magnificently. Awarded for 10 total resets.', type: 'title' },
    { id: 'perfect-score', name: 'Perfectionist', description: 'Achieved a perfect score on a quiz.', type: 'badge' },
];

export const miniGameData: MiniGameRound[] = [
    { id: 'mg1', imageIds: ['minigame1-pic1', 'minigame1-pic2', 'minigame1-pic3', 'minigame1-pic4'], answer: 'PERIPHERAL', hint: 'Devices connected to a computer.' },
    { id: 'mg2', imageIds: ['minigame2-pic1', 'minigame2-pic2', 'minigame2-pic3', 'minigame2-pic4'], answer: 'NETWORK', hint: 'Connecting computers together.' },
    { id: 'mg3', imageIds: ['minigame3-pic1', 'minigame3-pic2', 'minigame3-pic3', 'minigame3-pic4'], answer: 'SERVER', hint: 'Provides services to other computers.' },
    { id: 'mg4', imageIds: ['minigame4-pic1', 'minigame4-pic2', 'minigame4-pic3', 'minigame4-pic4'], answer: 'MAINTENANCE', hint: 'Keeping a system in good condition.' },
    { id: 'mg5', imageIds: ['minigame5-pic1', 'minigame5-pic2', 'minigame5-pic3', 'minigame5-pic4'], answer: 'HARDWARE', hint: 'The physical parts of a computer.' },
];
