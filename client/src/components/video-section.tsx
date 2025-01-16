import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export function VideoSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="v-0">
        <motion.video
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-[100%] m-auto min-h-[300px]"
        />
      </div>
    </section>
  );
}
