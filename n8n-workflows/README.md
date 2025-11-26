# PolyMathOS n8n Workflow Automation

This directory contains n8n workflow configurations for automating learning tasks in PolyMathOS.

## Setup

1. Access your n8n instance at: `https://n8n.srv946202.hstgr.cloud`
2. Import the workflow JSON files below
3. Configure credentials as needed (API keys, webhook URLs)

## Workflows

### 1. Daily Review Scheduler
Sends daily reminders for spaced repetition reviews.

**Trigger:** Schedule (e.g., 8:00 AM daily)
**Actions:**
- Fetch FSRS cards due for review via API
- Send notification (email/push) with review count
- Track review completion

```json
{
  "name": "Daily Review Scheduler",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 8 * * *" }]
        }
      }
    },
    {
      "name": "Get Due Cards",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/learning/fsrs/due/{{$json.userId}}",
        "method": "GET"
      }
    },
    {
      "name": "Send Reminder",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "subject": "Time to Review! You have {{$json.total_due}} cards due",
        "text": "Your spaced repetition review is ready. Complete your reviews to maintain memory strength."
      }
    }
  ]
}
```

### 2. Weekly Progress Report
Generates and sends weekly learning progress reports.

**Trigger:** Schedule (Sunday 6:00 PM)
**Actions:**
- Fetch comprehension metrics
- Generate progress report via API
- Create visualization (chart)
- Email report to user

```json
{
  "name": "Weekly Progress Report",
  "nodes": [
    {
      "name": "Weekly Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 18 * * 0" }]
        }
      }
    },
    {
      "name": "Get Progress",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/learning/progress/{{$json.userId}}/history?period=weekly",
        "method": "GET"
      }
    },
    {
      "name": "Generate Report",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/learning/progress/{{$json.userId}}",
        "method": "GET"
      }
    },
    {
      "name": "Format Report",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const data = $input.all()[0].json;\nreturn [{\n  json: {\n    subject: `Weekly Learning Report - ${data.overall_score}% Comprehension`,\n    body: `\n# Your Weekly Progress\n\n## Overall Score: ${data.overall_score}%\nTrend: ${data.trend}\n\n## Dimension Scores\n- Memory: ${data.dimensions.memory}%\n- Understanding: ${data.dimensions.understanding}%\n- Application: ${data.dimensions.application}%\n- Analysis: ${data.dimensions.analysis}%\n- Synthesis: ${data.dimensions.synthesis}%\n- Creation: ${data.dimensions.creation}%\n\n## Recommendations\n${data.recommendations.map(r => '- ' + r).join('\\n')}\n    `\n  }\n}];"
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend"
    }
  ]
}
```

### 3. Adaptive Content Generator
Generates new learning content after quiz completion.

**Trigger:** Webhook (POST /quiz-complete)
**Actions:**
- Analyze quiz performance
- Identify weak areas
- Generate targeted content via AI
- Create new quiz questions
- Update learning plan

```json
{
  "name": "Adaptive Content Generator",
  "nodes": [
    {
      "name": "Quiz Complete Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "quiz-complete",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Analyze Performance",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const quiz = $input.all()[0].json;\nconst weakAreas = quiz.comprehension_analysis.weak_areas;\nconst topic = quiz.topic;\nreturn [{ json: { topic, weakAreas, userId: quiz.user_id } }];"
      }
    },
    {
      "name": "Generate Questions",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/learning/quiz/generate",
        "method": "POST",
        "body": {
          "topic": "={{$json.topic}}",
          "question_count": 5,
          "focus_areas": "={{$json.weakAreas}}"
        }
      }
    },
    {
      "name": "Notify User",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/notifications",
        "method": "POST",
        "body": {
          "userId": "={{$json.userId}}",
          "message": "New practice questions generated for your weak areas!"
        }
      }
    }
  ]
}
```

### 4. Memory Palace Refresh
Triggers memory palace review sessions.

**Trigger:** Schedule (based on last review date)
**Actions:**
- Check palaces due for review
- Generate review session
- Send guided walkthrough notification

```json
{
  "name": "Memory Palace Refresh",
  "nodes": [
    {
      "name": "Daily Check",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 10 * * *" }]
        }
      }
    },
    {
      "name": "Get Palaces Due",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/learning/palace/due",
        "method": "GET"
      }
    },
    {
      "name": "Filter Due",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.palaces.length}}",
              "value2": 0,
              "operation": "notEqual"
            }
          ]
        }
      }
    },
    {
      "name": "Send Notification",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "subject": "Time to walk through your Memory Palace!",
        "text": "You have {{$json.palaces.length}} memory palace(s) due for review. Take a mental walk to strengthen your memories."
      }
    }
  ]
}
```

### 5. Feynman Practice Reminder
Reminds users to practice Feynman technique on recent topics.

**Trigger:** Schedule (3 days after learning new topic)
**Actions:**
- Check recently learned topics
- Send Feynman practice prompt
- Track completion

```json
{
  "name": "Feynman Practice Reminder",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 14 * * *" }]
        }
      }
    },
    {
      "name": "Get Recent Topics",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.POLYMATHOS_API_URL}}/api/learning/topics/recent?days=3",
        "method": "GET"
      }
    },
    {
      "name": "Filter Unpracticed",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const topics = $input.all()[0].json.topics;\nconst unpracticed = topics.filter(t => !t.feynman_completed);\nreturn [{ json: { topics: unpracticed } }];"
      }
    },
    {
      "name": "Send Reminder",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "subject": "Can you explain it simply? - Feynman Practice",
        "text": "You learned about {{$json.topics[0].name}} recently. Try explaining it as if teaching a child to solidify your understanding!"
      }
    }
  ]
}
```

## Environment Variables

Set these in your n8n instance:

```
POLYMATHOS_API_URL=http://your-server:8000
POLYMATHOS_API_KEY=your-api-key
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_USER=user@example.com
EMAIL_SMTP_PASSWORD=your-password
```

## Webhook Endpoints

Configure these webhooks in your PolyMathOS instance to trigger n8n workflows:

| Event | Webhook URL | Method |
|-------|-------------|--------|
| Quiz Completed | `https://n8n.srv946202.hstgr.cloud/webhook/quiz-complete` | POST |
| Learning Session End | `https://n8n.srv946202.hstgr.cloud/webhook/session-end` | POST |
| Goal Achieved | `https://n8n.srv946202.hstgr.cloud/webhook/goal-achieved` | POST |
| Streak Milestone | `https://n8n.srv946202.hstgr.cloud/webhook/streak-milestone` | POST |

## Importing Workflows

1. Copy the JSON configuration for the workflow you want
2. In n8n, go to **Workflows** > **Add Workflow**
3. Click **...** menu > **Import from URL/File**
4. Paste the JSON and save
5. Configure credentials (email, API keys)
6. Activate the workflow

## Customization

Each workflow can be customized:

- **Schedule times:** Adjust cron expressions to match user preferences
- **Notification channels:** Switch between email, Slack, Discord, etc.
- **Content generation:** Modify AI prompts for different output styles
- **Filtering logic:** Adjust thresholds for when workflows trigger

