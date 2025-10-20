import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/state/gameStore';

export function LoadingScreen() {
  const loading = useGameStore((state) => state.loading);

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-24 w-24 rounded-full border-4 border-neon-blue border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-6 font-semibold uppercase tracking-widest text-neon-blue">
            Sincronizando Sistemas
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
