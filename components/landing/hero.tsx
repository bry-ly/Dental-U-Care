import { ArrowRight, Calendar} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import TypingText from "@/components/ui/typing-text";
import Link from "next/link";
const Hero = () => {
  return (
    <section>
      <div className="container mt-5 ">
        <div className="bg-muted/25 grid items-center gap-8 lg:grid-cols-2 border rounded-lg shadow-lg">
          <div className="flex flex-col items-center p-16 text-center lg:items-start lg:text-left">
            <div className="mb-6 flex items-center gap-3">
              <Image
                src="/tooth.svg"
                alt="Dental U Care Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <ShimmeringText
                text="Dental U-Care"
                className="text-2xl font-bold"
                shimmeringColor="rgb(147 51 234)"
                color="rgb(37 99 235)"
                duration={2}
              />
            </div>
            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl min-h-[120px] lg:min-h-[160px] flex items-start">
              <TypingText
                text={[
                  "Your Smile, Our Priority",
                  "Book Appointments Online",
                  "Smile with Confidence",
                  "Expert Dental Care for you"
                ]}
                typingSpeed={80}
                deletingSpeed={50}
                pauseDuration={2000}
                loop={true}
                showCursor={true}
                cursorClassName="bg-primary"
                cursorCharacter="|"
                className="inline-block"
              />
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
              Book your dental appointment online in minutes. Choose your
              preferred date, time, and service. Real-time availability with
              instant confirmation.
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                <Link href="/dashboard/patient" className="flex items-center">Book Appointment Now</Link>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/get-started" className="flex items-center">
                  Get Started
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-muted-foreground text-xs">Happy Patients</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-muted-foreground text-xs">Expert Dentists</p>
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-muted-foreground text-xs">
                  Satisfaction Rate
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-full w-full overflow-hidden rounded-r-lg sm:rounded-lg md:rounded-lg">
            <Image
              src="/smile.jpg"
              alt="Professional dental care at Dental U Care"
              width={600}
              height={500}
              priority
              className="h-full w-full object-cover dark:brightness-75"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
