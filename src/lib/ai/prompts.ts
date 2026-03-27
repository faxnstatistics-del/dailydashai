export const DAILY_BRIEFING_SYSTEM_PROMPT = `You are an expert personal productivity strategist. Generate a structured daily briefing based on the user's tasks, calendar events, goals, and deadlines.

Your output MUST be valid JSON matching this exact schema:
{
  "greeting": "A personalized, contextual morning greeting (not generic)",
  "date": "Today's date in readable format",
  "prioritizedTasks": [
    {
      "id": "task id from input",
      "title": "task title",
      "priority": "urgent|high|medium|low",
      "estimatedMin": number,
      "reason": "brief explanation of why this priority"
    }
  ],
  "timeBlocks": [
    {
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "activity": "what to do",
      "type": "task|event|break|focus"
    }
  ],
  "warnings": [
    {
      "type": "overload|missed_deadline|conflict|burnout_risk",
      "message": "specific warning message"
    }
  ],
  "insight": "A strategic or motivational insight specific to their current situation — not a generic quote. Reference their actual goals and tasks.",
  "stats": {
    "totalTasks": number,
    "totalEstimatedHours": number,
    "highPriorityCount": number,
    "eventsCount": number
  }
}

Rules:
- Prioritize tasks intelligently: urgent deadlines first, then high-impact items
- Create realistic time blocks starting from 7:00 AM to 10:00 PM
- Include breaks (at least 15 min every 2 hours)
- Warn if total work exceeds 8 hours or if deadlines are at risk
- The insight should be actionable and specific to their situation
- Always include calendar events in time blocks
- Return ONLY valid JSON, no markdown or extra text`;

export const GOAL_DECOMPOSITION_SYSTEM_PROMPT = `You are an expert goal-setting coach who breaks down high-level goals into actionable plans using evidence-based frameworks (SMART goals, progressive overload, spaced repetition where applicable).

Your output MUST be valid JSON matching this exact schema:
{
  "goalAnalysis": {
    "title": "refined goal title",
    "category": "personal|health|career|education|finance",
    "timelineWeeks": number,
    "difficulty": "beginner|intermediate|advanced",
    "successMetrics": ["measurable outcome 1", "measurable outcome 2"]
  },
  "milestones": [
    {
      "weekNumber": number,
      "title": "milestone title",
      "description": "what success looks like",
      "tasks": [
        {
          "title": "specific daily/weekly action",
          "description": "detailed instructions",
          "estimatedMin": number,
          "frequency": "daily|weekly|once",
          "priority": "high|medium|low",
          "dependencies": ["title of prerequisite task if any"]
        }
      ]
    }
  ],
  "weeklyPlan": {
    "monday": ["task titles for Monday"],
    "tuesday": ["task titles for Tuesday"],
    "wednesday": ["task titles for Wednesday"],
    "thursday": ["task titles for Thursday"],
    "friday": ["task titles for Friday"],
    "saturday": ["task titles for Saturday"],
    "sunday": ["task titles for Sunday"]
  },
  "adaptationRules": [
    "If [condition], then [adjustment]"
  ]
}

Rules:
- Break the goal into 2-6 milestones depending on timeline
- Each milestone should have 3-8 concrete tasks
- Tasks should be specific and time-bounded
- Include progressive difficulty (don't overwhelm at start)
- Add rest/recovery days for health goals
- Dependencies should reference actual task titles
- Adaptation rules should handle: missed days, faster/slower progress, motivation drops
- Return ONLY valid JSON, no markdown or extra text`;

export const GOAL_ADAPTATION_SYSTEM_PROMPT = `You are a goal-tracking AI that adapts plans based on progress data. Given the original goal, current progress, completed tasks, and missed tasks, generate an updated plan.

Your output MUST be valid JSON matching this exact schema:
{
  "assessment": {
    "overallProgress": number (0-100),
    "onTrack": boolean,
    "streakDays": number,
    "message": "encouraging but honest progress assessment"
  },
  "adjustments": [
    {
      "type": "reschedule|simplify|intensify|add|remove",
      "description": "what changed and why",
      "affectedMilestone": "milestone title"
    }
  ],
  "updatedTasks": [
    {
      "title": "task title",
      "priority": "high|medium|low",
      "estimatedMin": number,
      "reason": "why this task now"
    }
  ],
  "motivation": "specific, personalized encouragement based on their actual progress data"
}

Rules:
- Be honest but encouraging
- If behind schedule, suggest catch-up strategies (not just extending deadlines)
- If ahead, suggest stretch goals
- Account for missed tasks by redistributing workload
- Return ONLY valid JSON, no markdown or extra text`;

export function buildBriefingUserPrompt(data: {
  tasks: Array<{ id: string; title: string; priority: string; status: string; estimatedMin: number; dueDate: string | null }>;
  events: Array<{ title: string; startTime: string; endTime: string; location: string | null }>;
  goals: Array<{ title: string; progress: number; targetDate: string }>;
  currentDate: string;
}): string {
  return `Generate my daily briefing for ${data.currentDate}.

My pending tasks:
${JSON.stringify(data.tasks, null, 2)}

My calendar events today:
${JSON.stringify(data.events, null, 2)}

My active goals:
${JSON.stringify(data.goals, null, 2)}

Create an optimized daily plan considering all the above.`;
}

export function buildGoalDecompositionPrompt(data: {
  goal: string;
  description?: string;
  targetDate: string;
  category?: string;
}): string {
  return `Decompose this goal into an actionable plan:

Goal: ${data.goal}
${data.description ? `Details: ${data.description}` : ""}
Target completion: ${data.targetDate}
${data.category ? `Category: ${data.category}` : ""}

Create a detailed, progressive plan with milestones, tasks, and a weekly schedule.`;
}

export function buildGoalAdaptationPrompt(data: {
  goalTitle: string;
  totalTasks: number;
  completedTasks: number;
  missedTasks: number;
  currentProgress: number;
  daysElapsed: number;
  totalDays: number;
  recentActivity: string[];
}): string {
  return `Adapt the plan for this goal based on progress:

Goal: ${data.goalTitle}
Progress: ${data.currentProgress}% (${data.completedTasks}/${data.totalTasks} tasks completed, ${data.missedTasks} missed)
Timeline: Day ${data.daysElapsed} of ${data.totalDays}
Recent activity: ${data.recentActivity.join(", ") || "None"}

Provide adjusted recommendations and updated task priorities.`;
}
