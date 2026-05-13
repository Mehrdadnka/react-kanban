// features/logo-3d/components/LogoCanvas.tsx
import { useRef, useState } from 'react'
import { LogoScene } from './LogoScene'
import * as Popover from '@radix-ui/react-popover';
import { XPProgressRing } from '@/components/xp/XPProgressRing';
import { motion, AnimatePresence } from 'framer-motion';
import { useXPStore } from '@/stores/xp/xp.store';
import { formatActionName, formatXP, getActionEmoji, getLevelEmoji, LevelDetailPopover } from '@/components/board/BoardList';
import { useApp } from '@/providers/AppProvider';
import { Activity, Award, CheckCircle2, ChevronDown, Flame, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spaceship } from '@/features/features/spaceship/Spaceship';
import { TopBar } from './TopBar';
import { ShipProvider } from '../context/ShipContext';

type LogoCanvasProps = {
  size?: number
  className?: string
}
// ──── Level Detail Popover ────

export const LogoCanvas = ({ size = 200, className = '' }: LogoCanvasProps) => {
  const [levelPopoverOpen, setLevelPopoverOpen] = useState(false);
  const [showAchievementsDropdown, setShowAchievementsDropdown] = useState(false);
  
  const isDarkMode = useApp();    
  const { 
    totalXP, currentLevel, levelProgress, xpToNextLevel,
    streak, achievements, events 
  } = useXPStore();
  const unlockedAchievements = achievements.filter(a => a.completed);
  const recentEvents = events.slice(-5).reverse();

  const shipRef = useRef<THREE.Group>(null!)


  return (
    <div style={{ width: innerWidth, height: innerHeight - 50 }} className={className}>
      {/* ===== TOP BAR: Compact XP + Stats (Fixed Height) ===== */}
                <div className="flex-shrink-0 w-[calc(100vw-180px)] flex items-center justify-between flex-wrap gap-3">
                     {/* Left: XP System with Level Popover */}
                  <Popover.Root open={levelPopoverOpen} onOpenChange={setLevelPopoverOpen}>
                    <Popover.Trigger asChild>
                      <button className="flex items-center gap-3 group cursor-pointer">
                        <XPProgressRing progress={levelProgress} size={48} strokeWidth={3}>
                          <motion.span 
                            className="text-lg"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {getLevelEmoji(currentLevel)}
                          </motion.span>
                        </XPProgressRing>
                        
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold">
                              Lv.{currentLevel}
                            </span>
                            <ChevronDown 
                              size={12} 
                              className={cn(
                                'text-gray-400 transition-transform duration-200',
                                levelPopoverOpen && 'rotate-180'
                              )}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-20 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 tabular-nums">
                              {formatXP(totalXP)}
                            </span>
                          </div>
                          {streak.current >= 3 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Flame size={10} className="text-orange-500" />
                              <span className="text-[10px] text-orange-500 font-medium">
                                {streak.current} days
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    </Popover.Trigger>
                    
                    <Popover.Portal>
                      <LevelDetailPopover
                        isDarkMode={isDarkMode as any}
                        currentLevel={currentLevel}
                        levelProgress={levelProgress}
                        totalXP={totalXP}
                        xpToNextLevel={xpToNextLevel}
                        streak={streak}
                        achievements={achievements}
                        events={events}
                      />
                    </Popover.Portal>
                  </Popover.Root>
                  <div className='flex flex-row items-center justify-between'>
                         {/* ===== RECENT ACTIVITY BAR (Compact, Fixed Height) ===== */}
                {recentEvents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-3 px-3 py-1.5 rounded-xl overflow-hidden',
                      isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Activity size={12} className="text-gray-400" />
                      <span className="text-[10px] font-medium text-gray-400">Recent</span>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-none">
                      {recentEvents.map((event, i) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-1 flex-shrink-0"
                        >
                          <span className="text-sm">{getActionEmoji(event.action)}</span>
                          <span className="text-[10px] text-gray-500">
                            {formatActionName(event.action)}
                          </span>
                          <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                            +{event.finalAmount}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                 {/* Right: Quick Actions */}
                  <div className="flex items-center gap-2">
                    {/* Achievements Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAchievementsDropdown(!showAchievementsDropdown)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          'hover:bg-gray-100 dark:hover:bg-gray-800',
                          'text-gray-600 dark:text-gray-400',
                          showAchievementsDropdown && 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                        )}
                      >
                        <Trophy size={14} className="text-yellow-500" />
                        <span>{unlockedAchievements.length}/{achievements.length}</span>
                        <ChevronDown 
                          size={10} 
                          className={cn(
                            'transition-transform duration-200',
                            showAchievementsDropdown && 'rotate-180'
                          )}
                        />
                      </button>
      
                      {/* Dropdown */}
                      <AnimatePresence>
                        {showAchievementsDropdown && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowAchievementsDropdown(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className={cn(
                                'absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-2xl z-50 p-4',
                                isDarkMode
                                  ? 'bg-gray-900 border-gray-700'
                                  : 'bg-white border-gray-200'
                              )}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-semibold flex items-center gap-1.5">
                                  <Award size={12} className="text-yellow-500" />
                                  Achievements
                                </h4>
                                <span className="text-[10px] text-gray-400">
                                  {unlockedAchievements.length} unlocked
                                </span>
                              </div>
      
                              <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                                {achievements.slice(0, 6).map((ach) => (
                                  <div
                                    key={ach.id}
                                    className={cn(
                                      'flex items-center gap-2 p-2 rounded-lg text-xs',
                                      ach.completed
                                        ? isDarkMode
                                          ? 'bg-yellow-500/10'
                                          : 'bg-yellow-50'
                                        : 'opacity-50'
                                    )}
                                  >
                                    <span className={cn(
                                      'text-lg flex-shrink-0',
                                      !ach.completed && 'grayscale'
                                    )}>
                                      {ach.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">
                                        {ach.completed ? ach.name : '???'}
                                      </div>
                                      {!ach.completed && (
                                        <div className="text-[10px] text-gray-400">
                                          {ach.currentCount}/{ach.requiredCount}
                                        </div>
                                      )}
                                    </div>
                                    {ach.completed && (
                                      <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
      
                              {achievements.length > 6 && (
                                <button
                                  onClick={() => {
                                    setShowAchievementsDropdown(false);
                                    setLevelPopoverOpen(true);
                                    setTimeout(() => {
                                      // Switch to achievements tab
                                      const tabTrigger = document.querySelector('[data-value="achievements"]');
                                      if (tabTrigger) (tabTrigger as HTMLElement).click();
                                    }, 100);
                                  }}
                                  className="w-full text-center text-[10px] text-blue-500 hover:text-blue-600 mt-2 py-1"
                                >
                                  View all {achievements.length} achievements →
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
      
                    {/* Total XP Badge */}
                    <div className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
                      isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                    )}>
                      <Zap size={14} className="text-blue-500" />
                      <span className="text-blue-600 dark:text-blue-400 tabular-nums">
                        {formatXP(totalXP)}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>

      {/* <LogoScene /> */}
      
      <LogoScene shipRef={shipRef}>
        <Spaceship ref={shipRef} />
      </LogoScene>
    </div>
  )
}