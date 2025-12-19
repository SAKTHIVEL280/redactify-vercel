import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle, MessagesSquare, Bug, Search, Sparkles } from 'lucide-react';

/**
 * Feedback Modal Component
 * Allows users to submit feedback, bug reports, and improvement suggestions
 * Integrates with Resend API for email delivery
 */
export default function FeedbackModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    type: 'feedback', // feedback, bug, missing_pii, improvement
    email: '',
    subject: '',
    message: '',
    attachmentType: '' // If PII was missed, what type?
  });
  
  const [status, setStatus] = useState({ type: '', message: '' }); // success, error, loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'feedback', label: 'General Feedback', icon: MessagesSquare },
    { value: 'bug', label: 'Bug Report', icon: Bug },
    { value: 'missing_pii', label: 'Missed PII Detection', icon: Search },
    { value: 'improvement', label: 'Feature Request', icon: Sparkles }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Validation
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please provide a message' });
      setIsSubmitting(false);
      return;
    }

    try {
      // For local/demo version, just show email address
      // In production, this would send via API
      if (import.meta.env.DEV || !import.meta.env.VITE_FEEDBACK_API) {
        // Local development - show email message
        setStatus({ 
          type: 'success', 
          message: `Thank you! Please email your ${feedbackTypes.find(t => t.value === formData.type)?.label.toLowerCase()} to support@redactify.com` 
        });
        
        setTimeout(() => {
          setFormData({
            type: 'feedback',
            email: '',
            subject: '',
            message: '',
            attachmentType: ''
          });
          setStatus({ type: '', message: '' });
          onClose();
        }, 4000);
        
        setIsSubmitting(false);
        return;
      }
      
      // Send feedback via Resend API (production only)
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          email: formData.email || 'anonymous@redactify.com',
          subject: formData.subject || `[${feedbackTypes.find(t => t.value === formData.type)?.label}] New submission`,
          message: formData.message,
          attachmentType: formData.attachmentType,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: 'Thank you! Your feedback has been received. We\'ll review it shortly.' 
        });
        
        // Reset form
        setTimeout(() => {
          setFormData({
            type: 'feedback',
            email: '',
            subject: '',
            message: '',
            attachmentType: ''
          });
          setStatus({ type: '', message: '' });
          onClose();
        }, 3000);
      } else {
        // Try to parse error response, but handle cases where it's not JSON
        let errorMessage = 'Failed to send feedback';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response wasn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: `Failed to send feedback: ${error.message}. Please try again or email us directly at support@redactify.com` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">\n          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send Feedback</h2>
              <p className="text-sm text-zinc-400">Help us improve Redactify</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What's this about?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.type === type.value
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <type.icon className={`w-4 h-4 ${
                      formData.type === type.value ? 'text-red-500' : 'text-zinc-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.type === type.value ? 'text-white' : 'text-zinc-400'
                    }`}>
                      {type.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Your Email <span className="text-zinc-500 text-xs">(optional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief summary"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* If PII Detection issue, ask what was missed */}
          {formData.type === 'missing_pii' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                What type of PII was missed?
              </label>
              <select
                value={formData.attachmentType}
                onChange={(e) => setFormData({ ...formData, attachmentType: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="">Select type...</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone Number</option>
                <option value="address">Address</option>
                <option value="ssn">SSN/Tax ID</option>
                <option value="dob">Date of Birth</option>
                <option value="credit_card">Credit Card</option>
                <option value="passport">Passport</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Details
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={
                formData.type === 'bug' 
                  ? 'Describe what happened...'
                  : formData.type === 'missing_pii'
                  ? 'Describe the PII that was not detected...'
                  : 'Share your thoughts...'
              }
              rows={4}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              status.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-xs ${
                status.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {status.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Feedback
              </>
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-zinc-500 text-center">
            We respect your privacy and will only use your email for follow-up if provided.
          </p>
        </form>
      </div>
    </div>
  );
}
