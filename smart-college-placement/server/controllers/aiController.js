const axios = require('axios');
const asyncHandler = require('../utils/asyncHandler');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');

// Groq Service - AI Chat
exports.aiChat = asyncHandler(async (req, res) => {
  const { message, studentId } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI college placement assistant. Provide practical advice on resume building, interview preparation, job searching, technical skills, and career development. Be encouraging and specific.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error communicating with AI service',
      error: error.message,
    });
  }
});

// AI Resume Analysis
exports.resumeAnalysis = asyncHandler(async (req, res) => {
  const { resumeText, studentId } = req.body;

  if (!resumeText) {
    return res.status(400).json({ success: false, message: 'Please provide resume text' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume reviewer for college placements. Analyze the given resume and provide:
1. Strengths
2. Missing skills or sections
3. Improvement suggestions
4. ATS (Applicant Tracking System) suggestions
5. Recommended technologies or certifications

Provide concise, actionable feedback.`,
          },
          {
            role: 'user',
            content: `Please review this resume and provide feedback:\n\n${resumeText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const analysis = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message,
    });
  }
});

// AI Interview Preparation
exports.interviewPreparation = asyncHandler(async (req, res) => {
  const { jobTitle, company, skills, studentId } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ success: false, message: 'Please provide job title' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach for ${jobTitle} positions. Provide comprehensive interview preparation including:
1. Common technical questions
2. HR questions
3. Company-specific insights
4. Behavioral questions
5. Preparation tips
6. Salary negotiation tips

Be specific and practical.`,
          },
          {
            role: 'user',
            content: `I have an interview for a ${jobTitle} position${company ? ` at ${company}` : ''}. ${skills ? `My skills include: ${skills.join(', ')}` : ''}. Please prepare me for this interview.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const preparation = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      preparation,
    });
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating interview preparation',
      error: error.message,
    });
  }
});

// AI Job Recommendation with Explanation
exports.jobRecommendation = asyncHandler(async (req, res) => {
  const { studentId } = req.body;

  try {
    // Get student profile
    const studentProfile = await StudentProfile.findOne({ userId: studentId }).populate('userId');

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get eligible jobs
    const jobs = await Job.find({
      eligibleDepartments: studentProfile.department,
      minimumCGPA: { $lte: studentProfile.cgpa },
      maximumBacklogs: { $gte: studentProfile.backlogs },
      status: 'Approved',
    })
      .populate('companyId')
      .limit(5);

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: 'No suitable jobs found based on your profile',
      });
    }

    // Use Groq to generate recommendations
    const jobsContext = jobs.map((j) => `- ${j.title} at ${j.companyId.companyName}`).join('\n');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a career guidance AI for college placements. Based on the student's profile and available jobs, provide personalized recommendations.`,
          },
          {
            role: 'user',
            content: `Student Profile:
- Department: ${studentProfile.department}
- CGPA: ${studentProfile.cgpa}
- Skills: ${studentProfile.skills.join(', ')}
- Technical Skills: ${studentProfile.technicalSkills.join(', ')}

Available Jobs:
${jobsContext}

Please provide personalized recommendations with reasoning for each match.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const recommendation = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      jobs,
      recommendation,
    });
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message,
    });
  }
});
