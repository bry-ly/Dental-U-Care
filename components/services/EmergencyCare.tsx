"use client";
import { ShieldAlert } from "lucide-react";
import Image from "next/image";

export function EmergencyCare() {
  return (
    <section className="w-full max-w-2xl mt-2 mb-8 mx-auto">
      <div className="space-y-4 text-center">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Emergency Dental Care
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg tracking-tight md:text-xl">
          Same-day treatment for tooth pain, injuries, and urgent issues
        </p>
      </div>
      <div className="rounded-xl border p-6 shadow-lg dark:shadow-xl dark:shadow-gray-900/50 transition-shadow duration-300 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/70 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 mt-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-full p-3 shadow-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Emergency Dental Care</h3>
          <div className="flex items-center gap-2 sm:ml-4">
            <Image
              src="/jewel.jpg"
              alt="Jewel Menadano"
              className="w-10 h-10 rounded-full object-cover border"
              width={40}
              height={40}
              priority
            />
            <span className="font-semibold">Jewel Mendano</span>
            <span className="text-primary text-sm">Oral Surgeon</span>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Same-day emergency services for dental injuries, severe toothaches,
          broken teeth, and other urgent dental issues.
        </p>
        <ul className="space-y-2 text-left mb-6">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 inline-block" />
            Tooth Pain Relief
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 inline-block" />
            Broken Tooth Repair
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 inline-block" />
            Same-Day Treatment
          </li>
        </ul>
        {/* Team Member */}

        {/* Pricing */}
        <div className="mt-4">
          <div className="font-bold mb-2">Pricing</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span>Tooth Pain Relief</span>
              <span className="font-semibold text-primary">
                ₱1,500 – ₱5,000
              </span>
            </li>
            <li className="flex justify-between">
              <span>Broken Tooth Repair</span>
              <span className="font-semibold text-primary">
                ₱3,000 – ₱10,000+
              </span>
            </li>
            <li className="flex justify-between">
              <span>Same-Day Treatment</span>
              <span className="font-semibold text-primary">Varies</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
