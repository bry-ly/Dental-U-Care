"use client"
import { Stethoscope } from "lucide-react";
import Image from "next/image";
import { serviceCategories } from "@/lib/types/services-data";

export function PreventiveCare() {
  const preventiveServices = serviceCategories.find(cat => cat.id === "basic")?.services || [];

  return (
    <section className="w-full max-w-2xl mt-5 mb-8 mx-auto">
      <div className="space-y-4 text-center">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Preventive Care
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg tracking-tight md:text-xl">
          Cleanings, exams, and routine check-ups to keep smiles healthy
        </p>
      </div>
      <div className="rounded-xl border p-6 shadow-lg dark:shadow-xl dark:shadow-gray-900/50 transition-shadow duration-300 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/70 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 mt-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full p-3 shadow-lg">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">General Dentistry</h3>
          <div className="flex items-center gap-4 sm:ml-15">
            <Image
              src="/marthaliza.jpg"
              alt="Marthaliza Herher"
              className="w-10 h-10 rounded-full object-cover border"
              width={40}
              height={40}
              priority
            />
            <span className="font-semibold">Marthaliza Herher</span>
          <span className="text-primary text-sm">Periodontist</span>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Comprehensive oral health care including routine checkups,
          professional cleanings, and preventive treatments to maintain your
          dental health.
        </p>
        <ul className="space-y-2 text-left mb-6">
          {preventiveServices.slice(0, 3).map((service) => (
            <li key={service.id} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 inline-block" />
              {service.name}
            </li>
          ))}
        </ul>
        {/* Team Member */}
        {/* Pricing */}
        <div className="mt-4">
          <div className="font-bold mb-2">Pricing</div>
          <ul className="text-sm space-y-1">
            {preventiveServices.slice(0, 3).map((service) => (
              <li key={service.id} className="flex justify-between">
                <span>{service.name}</span>
                <span className="font-semibold text-primary">{service.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
