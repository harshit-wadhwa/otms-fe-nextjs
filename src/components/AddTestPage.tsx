'use client';

import React, { useState } from 'react';
import { apiClient } from '@/utils/apiClient';

// TypeScript interfaces
interface Question {
  question: string;
  options: string[];
  answer: string;
  score: number;
}

interface TestData {
  name: string;
  description: string;
  time: number;
  questions: Question[];
}

const AddTestPage = () => {
  const [testData, setTestData] = useState<TestData>({
    name: '',
    description: '',
    time: 0,
    questions: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Add a new question to the form
  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      options: ['', ''], // Start with 2 options by default
      answer: '',
      score: 0
    };
    setTestData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Remove a question from the form
  const removeQuestion = (index: number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Add an option to a specific question
  const addOption = (questionIndex: number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...q.options, ''] }
          : q
      )
    }));
  };

  // Remove an option from a specific question
  const removeOption = (questionIndex: number, optionIndex: number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.filter((_, j) => j !== optionIndex)
            }
          : q
      )
    }));
  };

  // Update test basic info
  const handleTestChange = (field: keyof TestData, value: string | number) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update question data
  const handleQuestionChange = (questionIndex: number, field: keyof Question, value: string | number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  // Update question options
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                j === optionIndex ? value : opt
              )
            } 
          : q
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!testData.name.trim()) {
      setMessage('Test name is required');
      return;
    }
    
    if (testData.questions.length === 0) {
      setMessage('At least one question is required');
      return;
    }

    // Validate each question
    for (let i = 0; i < testData.questions.length; i++) {
      const q = testData.questions[i];
      if (!q.question.trim()) {
        setMessage(`Question ${i + 1} is required`);
        return;
      }
      if (q.options.length < 2) {
        setMessage(`Question ${i + 1} must have at least 2 options`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setMessage(`All options for question ${i + 1} are required`);
        return;
      }
      if (!q.answer.trim()) {
        setMessage(`Answer for question ${i + 1} is required`);
        return;
      }
      if (q.score <= 0) {
        setMessage(`Score for question ${i + 1} must be greater than 0`);
        return;
      }
    }

    setLoading(true);
    setMessage('');

    try {
      // Prepare payload matching the exact API specification
      const payload = {
        name: testData.name,
        time: testData.time,
        questions: testData.questions.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          score: q.score
        }))
      };

      console.log('🚀 Sending API request to /teacher/test');
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      
      // Use the API client to make the request
      const response = await apiClient.post('/teacher/test', payload);
      
      console.log('✅ API Response:', response);
      setMessage('Test created successfully!');
      
      // Reset form
      setTestData({
        name: '',
        description: '',
        time: 0,
        questions: []
      });
    } catch (error) {
      console.error('❌ Failed to create test:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Create New Test</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Test Name *</label>
              <input
                type="text"
                value={testData.name}
                onChange={(e) => handleTestChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter test name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Time (seconds) *</label>
              <input
                type="number"
                value={testData.time}
                onChange={(e) => handleTestChange('time', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter time in seconds"
                min="1"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
              <textarea
                value={testData.description}
                onChange={(e) => handleTestChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter test description"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add Question
            </button>
          </div>

          {testData.questions.length === 0 && (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              No questions added yet. Click "Add Question" to get started.
            </p>
          )}

          {testData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Question {questionIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Question *</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Enter your question"
                    rows={2}
                    required
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Options *</label>
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors p-2"
                            title="Remove option"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {question.options.length < 2 && (
                    <p className="text-sm text-red-600 mt-1">At least 2 options are required</p>
                  )}
                </div>

                {/* Answer and Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Correct Answer *</label>
                    <input
                      type="text"
                      value={question.answer}
                      onChange={(e) => handleQuestionChange(questionIndex, 'answer', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Enter correct answer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Score *</label>
                    <input
                      type="number"
                      value={question.score}
                      onChange={(e) => handleQuestionChange(questionIndex, 'score', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Enter score"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Creating Test...' : 'Create Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTestPage; 