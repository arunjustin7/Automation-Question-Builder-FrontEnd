import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sun, Moon, Loader, Download, Star, MessageSquare, Shield, BarChart } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

const API_ENDPOINT = process.env.REACT_APP_new_url;
const socket = io(API_ENDPOINT);

const AdvancedQAGenerator = () => {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [tokenCount, setTokenCount] = useState(null);
  const [embeddingCost, setEmbeddingCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const contentRef = useRef();

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    socket.on('processing_complete', (data) => {
      toast.success(data.message);
    });

    return () => {
      socket.off('processing_complete');
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/check-auth`, { withCredentials: true });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };
    checkAuth();

    if (isAuthenticated) {
      fetchUser_Stats();
    }
  }, [isAuthenticated]);

  const fetchUser_Stats = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/user-stats`, { withCredentials: true });
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleActionChange = (e) => {
    setAction(e.target.value);
    setResult('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setTokenCount(null);
    setEmbeddingCost(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);
    formData.append('numQuestions', numQuestions);
    formData.append('difficulty', difficulty);
    if (action === 'QA') {
      formData.append('question', question);
    }

    try {
      const response = await axios.post(`${API_ENDPOINT}/process`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setResult(response.data.result);
      setTokenCount(response.data.token_count);
      setEmbeddingCost(response.data.embedding_cost);

      if (isAuthenticated) {
        fetchUser_Stats();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: 'Generated_Content',
  });

  const handleFeedbackSubmit = async () => {
    try {
      await axios.post(`${API_ENDPOINT}/feedback`, {
        question: result,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      setShowFeedback(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    // Your JSX code here
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900 dark:to-indigo-900 min-h-screen transition-colors duration-500">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-12 relative">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-0 p-4"
            >
              {/* <div className="flex justify-center items-center">
                                <img src={logo} className="h-28 w-30 max-h-full max-w-full object-contain" alt="Logo" />
                            </div> */}
              {/* <img src={logo} className='h-15 w-30 ' /> */}
              {/* <Crown size={70} className="text-purple-700 dark:text-purple-300" /> */}
            </motion.div>
            <h1 className="text-4xl font-bold text-center text-purple-700 dark:text-purple-300 mt-8">
              Automation  Question Builder
            </h1>
            <div className="flex justify-end mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 rounded-full bg-purple-500 text-white shadow-lg transition-colors duration-300 flex items-center space-x-2"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{darkMode ? 'Light' : 'Dark'} Realm</span>
              </motion.button>
            </div>
            {isAuthenticated && userStats && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-2">Your Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions Generated:</p>
                    <p className="text-lg font-medium text-purple-600 dark:text-purple-300">{userStats.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Difficulty:</p>
                    <p className="text-lg font-medium text-purple-600 dark:text-purple-300">{userStats.avgDifficulty}</p>
                  </div>
                </div>
              </div>
            )}
          </header>

          <main className="space-y-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className=" bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 transform perspective-1000 hover:rotate-y-5 transition-all duration-300"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  {...getRootProps()}
                  className="border-2 border-purple-800 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors dark:border-purple-400 group"
                >
                  <input {...getInputProps()} />
                  <FileText size={48} className="mx-auto text-purple-500 group-hover:text-purple-600 transition-colors" />
                  {isDragActive ? (
                    <p className="mt-4 text-purple-600 dark:text-purple-300">Drop the royal scroll here...</p>
                  ) : (
                    <p className="mt-4 text-purple-600 dark:text-purple-300">Summon a PDF scroll, or drag and drop it here</p>
                  )}
                  {file && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xl font-medium text-purple-600 dark:text-purple-300">Action</label>
                    <select
                      value={action}
                      onChange={handleActionChange}
                      className="mt-1 block w-full rounded-sm px-2 py-1 border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray- 600"
                    >
                      <option value="" className=" text-purple-600 dark:text-purple-300">Select an action</option>
                      <option value="MCQ" className=' text-purple-600 dark:text-purple-300'>MCQ</option>
                      <option value="QA" className=' text-purple-600 dark:text-purple-300'>Question Answering</option>
                      <option value="Fill-in-the-Blank" className=' text-purple-600 dark:text-purple-300'>Fill-in-the-blanks</option>
                      <option value="True-False" className=' text-purple-600 dark:text-purple-300'>True-False</option>
                      <option value="Short-Answer" className=' text-purple-600 dark:text-purple-300'>Short-Answer</option>

                    </select>
                  </div>

                  {(action === 'MCQ' || action === 'Fill-in-the-Blank' || action === 'True-False' || action === 'Short-Answer') && (
                    <>
                      <div>
                        <label className="block text-xl font-medium text-purple-600 dark:text-purple-300">Number of Questions</label>
                        <input
                          type="number"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(e.target.value)}
                          min="1"
                          max="10"
                          className="mt-1 block w-full rounded-sm px-2 py-1 border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xl font-medium text-purple-600 dark:text-purple-300">Difficulty</label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="mt-1 block w-full rounded-sm px-2 py-1 border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value="easy" className=' text-purple-600 dark:text-purple-300'>Easy</option>
                          <option value="medium" className=' text-purple-600 dark:text-purple-300'>Medium</option>
                          <option value="hard" className=' text-purple-600 dark:text-purple-300'>Hard</option>
                        </select>
                      </div>
                    </>
                  )}
                  {action === 'QA' && (
                    <div className="col-span-2">
                      <label className="block text-xl font-medium text-purple-600 dark:text-purple-300">Question</label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows="3"
                        className="mt-1 border block w-full rounded-md border-purple-500 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-purple-500 px-4 py-2 placeholder:text-xl text-md font-medium text-gray-700 dark:text-gray-300"
                        placeholder="Enter your question here"
                      ></textarea>
                    </div>
                  )}

                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!file || !action || loading}
                    className="w-full flex justify-center py-4 px-20 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader className="animate-spin h-6 w-5 mr-3" />
                    ) : (
                      'Generate Royal Knowledge'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white  rounded-lg shadow-xl "
                  ref={contentRef}
                >
                  <div className="px-6 py-4">
                    <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">Royal Decree</h3>
                  </div>
                  {/* <div className="prose dark:prose-invert max-w-none">
                                        {result.split('\n').map((line, index) => (
                                            <p key={index}>{line}</p>
                                        ))}
                                    </div> */}
                  <dl>
                    <div className="border-t border-purple-200 dark:border-purple-700 bg-purple-50 px-6 py-5 grid grid-cols-3 gap-4 dark:bg -purple-900" ref={contentRef}>
                      <dt className="text-sm font-medium text-purple-600 dark:text-purple-300">Royal Proclamation</dt>
                      <dd className="mt-1 text-sm text-purple-900 col-span-2 dark:text-purple-100">
                        <pre className="whitespace-pre-wrap">{result}</pre>
                      </dd>
                    </div>
                    <div className="px-6 py-5 flex justify-end gap-4">
                      <button
                        onClick={handlePrint}
                        className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => setShowFeedback(true)}
                        className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                      >
                        <MessageSquare size={16} />
                        <span>Feedback</span>
                      </button>
                    </div>
                    {/* <div className="px-6 py-5 flex justify-end">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handlePrint}
                                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition-colors duration-300"
                                            >
                                                <Download size={20} />
                                                <span>Create PDF</span>
                                            </motion.button>
                                        </div> */}
                    {tokenCount && (
                      <div className="bg-purple-50 px-6 py-5 grid grid-cols-3 gap-4 dark:bg-purple-900">
                        <dt className="text-sm font-medium text-purple-600 dark:text-purple-300">Royal Word Count</dt>
                        <dd className="mt-1 text-sm text-purple-900 col-span-2 dark:text-purple-100">{tokenCount}</dd>
                      </div>
                    )}
                    {embeddingCost && (
                      <div className="px-6 py-5 grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-purple-600 dark:text-purple-300">Royal Treasury Expense</dt>
                        <dd className="mt-1 text-sm text-purple-900 col-span-2 dark:text-purple-100">${embeddingCost.toFixed(4)}</dd>
                      </div>
                    )}
                  </dl>
                  {/* <div className="mt-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm  text-purple-300 dark:text-purple-600">
                                                Token Count: {tokenCount}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Embedding Cost: ${embeddingCost?.toFixed(4)}
                                            </p>
                                        </div>
                                    </div> */}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </motion.div>
            )}
            {isAuthenticated && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8"
              >
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-300 mb-4">Advanced Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => toast.info("Quiz generation feature coming soon!")}
                    className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    <BarChart className="w-8 h-8 text-purple-600 dark:text-purple-300 mb-2" />
                    <span className="text-purple-700 dark:text-purple-200">Generate Full Quiz</span>
                  </button>
                  <button
                    onClick={() => toast.info("AI model fine-tuning coming soon!")}
                    className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-300 mb-2" />
                    <span className="text-purple-700 dark:text-purple-200">Fine-tune AI Model</span>
                  </button>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600 dark:text-purple-300">Provide Feedback</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
              <div className="flex space-x-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    onClick={() => setFeedbackRating(star)}
                    className={`cursor-pointer ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Your feedback is valuable to us"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdvancedQAGenerator;