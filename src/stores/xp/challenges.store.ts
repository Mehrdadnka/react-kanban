import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useEventBus } from '@/stores/core/event-bus.store';
import { useXPStore } from './xp.store';
import type { XPAction } from './xp.types';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  action: XPAction;
  reward: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

interface ChallengeState {
  challenges: DailyChallenge[];
  dailyCompleted: number;
  weeklyCompleted: number;
  
  generateDailyChallenges: () => void;
  updateProgress: (action: XPAction) => void;
  claimReward: (challengeId: string) => void;
  getActiveChallenges: () => DailyChallenge[];
}

// Challenge templates
const CHALLENGE_TEMPLATES = [
  {
    title: 'Task Sprint',
    description: 'Complete {target} tasks',
    icon: '🏃',
    minTarget: 3,
    maxTarget: 5,
    action: 'task:completed' as XPAction,
    baseReward: 100,
    rewardPerTarget: 25,
  },
  {
    title: 'Early Bird',
    description: 'Complete {target} tasks before due date',
    icon: '🐦',
    minTarget: 2,
    maxTarget: 4,
    action: 'task:completed_early' as XPAction,
    baseReward: 150,
    rewardPerTarget: 50,
  },
  {
    title: 'Board Builder',
    description: 'Create {target} boards',
    icon: '🏗️',
    minTarget: 1,
    maxTarget: 2,
    action: 'board:created' as XPAction,
    baseReward: 80,
    rewardPerTarget: 40,
  },
  {
    title: 'Time Logger',
    description: 'Log time on {target} tasks',
    icon: '⏱️',
    minTarget: 3,
    maxTarget: 6,
    action: 'time:logged' as XPAction,
    baseReward: 50,
    rewardPerTarget: 15,
  },
  {
    title: 'Organization Pro',
    description: 'Add labels to {target} tasks',
    icon: '🏷️',
    minTarget: 3,
    maxTarget: 5,
    action: 'label:organized' as XPAction,
    baseReward: 40,
    rewardPerTarget: 10,
  },
];

const getRandomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      challenges: [],
      dailyCompleted: 0,
      weeklyCompleted: 0,
      
      generateDailyChallenges: () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        // Pick 3 random challenges
        const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        
        const newChallenges: DailyChallenge[] = selected.map(template => {
          const target = getRandomInt(template.minTarget, template.maxTarget);
          const reward = template.baseReward + (template.rewardPerTarget * target);
          
          return {
            id: uuidv4(),
            title: template.title,
            description: template.description.replace('{target}', target.toString()),
            icon: template.icon,
            target,
            current: 0,
            action: template.action,
            reward,
            completed: false,
            claimed: false,
            expiresAt: tomorrow,
            createdAt: now,
          };
        });
        
        set({ challenges: newChallenges });
        
        // Emit event
        useEventBus.getState().emit('challenges:generated', {
          count: newChallenges.length,
          totalReward: newChallenges.reduce((sum, c) => sum + c.reward, 0),
        });
      },
      
      updateProgress: (action) => {
        set(state => ({
          challenges: state.challenges.map(challenge => {
            if (challenge.completed || challenge.action !== action) {
              return challenge;
            }
            
            const newCurrent = challenge.current + 1;
            const completed = newCurrent >= challenge.target;
            
            if (completed && !challenge.completed) {
              // Emit challenge completed
              setTimeout(() => {
                useEventBus.getState().emit('challenge:completed', {
                  challengeId: challenge.id,
                  title: challenge.title,
                  reward: challenge.reward,
                });
              }, 50);
            }
            
            return {
              ...challenge,
              current: newCurrent,
              completed,
            };
          }),
        }));
      },
      
      claimReward: (challengeId) => {
        const challenge = get().challenges.find(c => c.id === challengeId);
        if (!challenge || !challenge.completed || challenge.claimed) return;
        
        // Grant XP reward
        useXPStore.getState().addXP('milestone:reached', {
          taskId: challengeId,
          boardId: 'challenges',
        });
        
        set(state => ({
          challenges: state.challenges.map(c =>
            c.id === challengeId ? { ...c, claimed: true } : c
          ),
          dailyCompleted: state.dailyCompleted + 1,
          weeklyCompleted: state.weeklyCompleted + 1,
        }));
        
        // Emit claimed event
        useEventBus.getState().emit('challenge:claimed', {
          challengeId,
          reward: challenge.reward,
        });
      },
      
      getActiveChallenges: () => {
        const now = new Date();
        return get().challenges.filter(c => 
          c.expiresAt > now && !c.claimed
        );
      },
    }),
    {
      name: 'challenges-store',
      partialize: (state) => ({
        challenges: state.challenges,
        dailyCompleted: state.dailyCompleted,
        weeklyCompleted: state.weeklyCompleted,
      }),
    }
  )
);

// Auto-expose
if (typeof window !== 'undefined') {
  (window as any).__challengeStore = useChallengeStore;
}