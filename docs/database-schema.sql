# Supabase Database Schema for Botkyrka Assist

This file contains the SQL commands to set up your Supabase database for the Botkyrka Assist chatbot.

## Instructions

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run each of the following SQL commands

## Database Schema

### 1. Question Logs Table
```sql
-- Question logs table
CREATE TABLE question_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  detected_language VARCHAR(5) NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_helpful BOOLEAN,
  sent_to_kommun BOOLEAN DEFAULT FALSE
);
```

### 2. Feedback Logs Table
```sql
-- Enhanced feedback logs table  
CREATE TABLE feedback_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES question_logs(id),
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  message_content TEXT,
  user_language VARCHAR(5),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Fallback Logs Table
```sql
-- Enhanced fallback logs table
CREATE TABLE fallback_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  user_language VARCHAR(5) NOT NULL,
  feedback TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Performance Indexes
```sql
-- Create indexes for better performance
CREATE INDEX idx_question_logs_timestamp ON question_logs(timestamp);
CREATE INDEX idx_question_logs_language ON question_logs(detected_language);
CREATE INDEX idx_feedback_logs_timestamp ON feedback_logs(timestamp);
CREATE INDEX idx_fallback_logs_timestamp ON fallback_logs(timestamp);
```

### 5. Row Level Security (Optional but Recommended)
```sql
-- Enable RLS
ALTER TABLE question_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_logs ENABLE ROW LEVEL SECURITY;  
ALTER TABLE fallback_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for logging)
CREATE POLICY "Allow anonymous inserts" ON question_logs 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON feedback_logs 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON fallback_logs 
  FOR INSERT TO anon WITH CHECK (true);
```

## Analytics Queries

Here are some useful queries for analyzing the data:

### Most Common Questions by Language
```sql
SELECT 
  detected_language,
  COUNT(*) as question_count,
  COUNT(CASE WHEN response_helpful = true THEN 1 END) as helpful_responses
FROM question_logs 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY detected_language
ORDER BY question_count DESC;
```

### Daily Usage Statistics
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_questions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CASE WHEN response_helpful = true THEN 1.0 ELSE 0.0 END) as helpfulness_rate
FROM question_logs 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Fallback Rate by Language
```sql
SELECT 
  user_language,
  COUNT(*) as fallback_count
FROM fallback_logs 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY user_language
ORDER BY fallback_count DESC;
```
