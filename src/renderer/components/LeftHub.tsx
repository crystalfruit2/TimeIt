import React, { useState } from 'react';
import { useTasksStore } from '../state/useTasksStore';
import { useFilteredTasks, useTasksLoading } from '../state/selectors';
import { Task, TaskType } from '../../../packages/shared/src/types';

const LeftHub: React.FC = () => {
  const {
    createTask,
    setActiveTask,
    setSearchQuery,
    activeTaskId,
    searchQuery,
  } = useTasksStore();

  const filteredTasks = useFilteredTasks();
  const isLoading = useTasksLoading();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('project');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    await createTask(newTaskName.trim(), newTaskType);
    setNewTaskName('');
    setShowAddForm(false);
  };

  const handleTaskClick = (task: Task) => {
    setActiveTask(task.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tasks
        </h2>
        
        {/* Search */}
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="task-input text-sm"
          />
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mt-3 w-full btn btn-primary btn-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Task'}
        </button>

        {/* Add Task Form */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="mt-3 space-y-2 fade-in">
            <input
              type="text"
              placeholder="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-input text-sm"
              autoFocus
            />
            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value as TaskType)}
              className="task-input text-sm"
            >
              <option value="project">Project</option>
              <option value="study_group">Study Group</option>
            </select>
            <button
              type="submit"
              disabled={!newTaskName.trim()}
              className="w-full btn btn-primary btn-sm"
            >
              Create Task
            </button>
          </form>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No tasks match your search' : 'No tasks yet. Create your first task!'}
          </div>
        ) : (
          <div className="p-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`task-item ${
                  task.id === activeTaskId ? 'task-item-active' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {task.name}
                  </div>
                  {task.type && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {task.type.replace('_', ' ')}
                    </div>
                  )}
                </div>
                
                {task.id === activeTaskId && (
                  <div className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with selected task info */}
      {activeTaskId && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Active Task
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {filteredTasks.find(t => t.id === activeTaskId)?.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftHub;
