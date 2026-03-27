import { motion } from "framer-motion";

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: { y: -5, opacity: 1 },
};

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-[6px] w-[6px] rounded-full bg-bot-accent"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.45,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.15,
          }}
          style={{
            boxShadow: "0 0 6px rgba(0, 212, 138, 0.35)",
          }}
        />
      ))}
    </div>
  );
}
