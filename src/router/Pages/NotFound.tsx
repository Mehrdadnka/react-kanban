import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Link } from '../Link';

export const NotFound = () => {
  return (
    <div className="h-[90dvh] w-full flex items-center justify-center relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8 
          }}
          className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20"
        >
          <FileQuestion className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-lg hover:bg-accent transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto"
        >
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              className="h-2 bg-primary/10 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8 + item * 0.2, duration: 0.4 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};