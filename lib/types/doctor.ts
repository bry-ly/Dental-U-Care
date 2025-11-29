export interface Doctor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

export const doctors: Doctor[] = [
  {
    id: "doctor-1",
    name: "Kath Estrada",
    role: "Chief Dentist & Orthodontist",
    avatar: "/kath.jpg",
  },
  {
    id: "doctor-2",
    name: "Jedd Offianga",
    role: "Cosmetic Dentistry Specialist",
    avatar: "/jedd.jpg",
  },
  {
    id: "doctor-3",
    name: "Jewel Mendano",
    role: "Oral Surgeon",
    avatar: "/jewel.jpg",
  },
  {
    id: "doctor-4",
    name: "Marthaliza Herher",
    role: "Periodontist",
    avatar: "/tooth.svg",
  },
];
