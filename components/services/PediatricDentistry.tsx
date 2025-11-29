"use client"
import { Baby } from "lucide-react";
import Image from "next/image";

export function PediatricDentistry() {
  return (
    <section className="w-full max-w-2xl mt-5 mb-8 mx-auto">
      <div className="space-y-4 text-center">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Pediatric Dentistry
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg tracking-tight md:text-xl">
          Gentle, kid-friendly dental care for your little ones
        </p>
      </div>
      <div className="rounded-xl border p-6 shadow-lg dark:shadow-xl dark:shadow-gray-900/50 transition-shadow duration-300 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/70 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 mt-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white rounded-full p-3 shadow-lg">
            <Baby className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Pediatric Dentistry</h3>
          <div className="flex items-center gap-2 sm:ml-2">
            <Image
              src="/kath.jpg"
              alt="Kath Estrada"
              className="w-10 h-10 rounded-full object-cover border"
              width={40}
              height={40}
              priority
            />
          <span className="font-semibold">Kath Estrada</span>
            <span className="text-primary text-sm">
              Chief Dentist & Pediatric Dentist
            </span>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Gentle, kid-friendly dental care designed to make children feel
          comfortable and establish healthy oral hygiene habits from an early
          age.
        </p>
        <ul className="space-y-2 text-left mb-6">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 inline-block" />
            Children`s Checkups
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 inline-block" />
            Fluoride Treatment
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 inline-block" />
            Sealants
          </li>
        </ul>
        {/* Team Member */}
        {/* Pricing */}
        <div className="mt-4">
          <div className="font-bold mb-2">Pricing</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span>Children`s Checkups</span>
              <span className="font-semibold text-primary">₱500 – ₱1,500</span>
            </li>
            <li className="flex justify-between">
              <span>Fluoride Treatment</span>
              <span className="font-semibold text-primary">₱700 – ₱1,500</span>
            </li>
            <li className="flex justify-between">
              <span>Sealants</span>
              <span className="font-semibold text-primary">
                ₱1,000 – ₱2,500
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
