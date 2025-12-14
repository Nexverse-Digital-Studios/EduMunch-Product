import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { projectStatus, overallProgress, currentFocus, techStack } from '../config/project-status';
import { cn } from '../utils/cn';

export const StatusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">EduMunch Development Status</h1>
              <p className="text-indigo-100">Real-time project progress tracker</p>
              <p className="text-sm text-indigo-200 mt-2">Last Updated: December 13, 2025</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{overallProgress.percentComplete}%</div>
              <div className="text-indigo-200 text-sm mt-1">Overall Complete</div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Phases</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{overallProgress.totalPhases}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{overallProgress.completedPhases}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">In Progress</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{overallProgress.inProgressPhases}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Tasks Done</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {overallProgress.completedTasks}/{overallProgress.totalTasks}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Focus */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Focus</h2>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                  {currentFocus.priority}
                </span>
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-2">
                Phase {currentFocus.phase}: {currentFocus.title}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                <span>Est. {currentFocus.estimatedDays} days</span>
                {currentFocus.blockers.length > 0 && (
                  <span className="text-red-600 dark:text-red-400">• {currentFocus.blockers.length} blockers</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Frontend</h3>
            <div className="space-y-3">
              {techStack.frontend.map((tech, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-dark-text-primary">{tech.name}</span>
                  <span className="text-gray-500 dark:text-dark-text-secondary">{tech.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Backend</h3>
            <div className="space-y-3">
              {techStack.backend.map((tech, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-dark-text-primary">{tech.name}</span>
                  <span className="text-gray-500 dark:text-dark-text-secondary">{tech.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-border-primary">
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">External Services</h3>
            <div className="space-y-3">
              {techStack.external.map((tech, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-dark-text-primary">{tech.name}</span>
                  <span className="text-gray-500 dark:text-dark-text-secondary">{tech.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phases Progress */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Development Phases</h2>

          {projectStatus.map((phase) => (
            <div
              key={phase.phase}
              className={cn(
                'bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-sm border-2 transition-all',
                phase.status === 'completed' && 'border-emerald-200 dark:border-emerald-800',
                phase.status === 'in-progress' && 'border-indigo-200 dark:border-indigo-800',
                phase.status === 'pending' && 'border-gray-200 dark:border-dark-border-primary'
              )}
            >
              {/* Phase Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white',
                      phase.status === 'completed' && 'bg-emerald-500 dark:bg-emerald-600',
                      phase.status === 'in-progress' && 'bg-indigo-500 dark:bg-indigo-600',
                      phase.status === 'pending' && 'bg-gray-400 dark:bg-gray-600'
                    )}
                  >
                    {phase.phase}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">{phase.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full',
                          phase.status === 'completed' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                          phase.status === 'in-progress' && 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
                          phase.status === 'pending' && 'bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400'
                        )}
                      >
                        {phase.status === 'completed' && '✓ Completed'}
                        {phase.status === 'in-progress' && '⏳ In Progress'}
                        {phase.status === 'pending' && '⏸ Pending'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-dark-text-secondary">{phase.progress}% complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-gray-200 dark:bg-dark-surface-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      phase.status === 'completed' && 'bg-emerald-500 dark:bg-emerald-600',
                      phase.status === 'in-progress' && 'bg-indigo-500 dark:bg-indigo-600',
                      phase.status === 'pending' && 'bg-gray-400 dark:bg-gray-600'
                    )}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2 mb-4">
                {phase.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 text-sm">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className={cn('text-gray-700 dark:text-dark-text-primary', task.completed && 'line-through text-gray-400 dark:text-gray-600')}>
                        {task.title}
                      </span>
                      {task.date && <span className="text-gray-400 dark:text-gray-500 ml-2">({task.date})</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              {phase.nextSteps && phase.nextSteps.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-dark-border-primary">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2">Next Steps:</h4>
                  <ul className="space-y-1">
                    {phase.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-dark-text-secondary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 dark:text-dark-text-secondary text-sm py-4">
          <p>EduMunch • Comprehensive Education Management System</p>
          <p className="mt-1">Started: December 13, 2025</p>
        </div>
      </div>
    </div>
  );
};
