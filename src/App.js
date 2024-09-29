import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Crown, FileText, Sun, Moon, Loader, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const API_ENDPOINT = 'http://localhost:5000';

const AdvancedQAGenerator = () => {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [tokenCount, setTokenCount] = useState(null);
  const [embeddingCost, setEmbeddingCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const contentRef = useRef();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

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
    if (action === 'MCQ' || action === 'Fill-in-the-Blank') {
      formData.append('numQuestions', numQuestions);
    } else if (action === 'QA') {
      formData.append('question', question);
    }

    try {
      const response = await axios.post(`${API_ENDPOINT}/process`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.result);
      setTokenCount(response.data.token_count);
      setEmbeddingCost(response.data.embedding_cost);
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

  return (
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
              <Crown size={70} className="text-purple-700" />
            </motion.div>
            <h1 className="text-4xl font-bold text-center text-purple-700 mt-8">
              Automated Question Generator
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
          </header>

          <main className="space-y-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 transform perspective-1000 hover:rotate-y-5 transition-all duration-300"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  {...getRootProps()}
                  className="border-3 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors dark:border-purple-400 group"
                >
                  <input {...getInputProps()} />
                  <FileText size={48} className="mx-auto text-purple-500 group-hover:text-purple-600 transition-colors" />
                  {isDragActive ? (
                    <p className="mt-4 text-purple-600 dark:text-purple-300">Drop the royal scroll here...</p>
                  ) : (
                    <p className="mt-4 text-purple-600 dark:text-purple-300">Summon a PDF scroll, Your Majesty</p>
                  )}
                  {file && <p className="mt-2 text-sm text-purple-500 dark:text-purple-300">Scroll: {file.name}</p>}
                </div>

                <div className="relative">
                  <select
                    id="action"
                    className="block w-full pl-3 pr-10 py-3 text-base border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-purple-600 dark:text-white appearance-none"
                    value={action}
                    onChange={handleActionChange}
                  >
                    <option value="">Choose your royal command</option>
                    <option value="MCQ">Multiple Choice Riddles</option>
                    <option value="QA">Royal Question Answering</option>
                    <option value="Fill-in-the-Blank">Fill in the Royal Blanks</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                {(action === 'MCQ' || action === 'Fill-in-the-Blank') && (
                  <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-purple-700 dark:text-purple-300">
                      Number of royal questions
                    </label>
                    <input
                      type="number"
                      id="numQuestions"
                      min={1}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      className="mt-1 block w-full border-2 border-purple-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                    />
                  </div>
                )}

                {action === 'QA' && (
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium text-purple-700 dark:text-purple-300">
                      Your royal inquiry
                    </label>
                    <input
                      type="text"
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="mt-1 block w-full border-2 border-purple-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                    />
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!file || !action || loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    'Summon Royal Knowledge'
                  )}
                </motion.button>
              </form>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-md dark:bg-red-900 dark:border-red-700 dark:text-red-100"
                role="alert"
              >
                <p className="font-bold">Royal Mishap!</p>
                <p>{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-2xl rounded-lg overflow-hidden dark:bg-gray-800"
              >
                <div className="px-6 py-4">
                  <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">Royal Decree</h3>
                </div>
                <div className="border-t border-purple-200 dark:border-purple-700">
                  <dl>
                    <div className="bg-purple-50 px-6 py-5 grid grid-cols-3 gap-4 dark:bg-purple-900" ref={contentRef}>
                      <dt className="text-sm font-medium text-purple-600 dark:text-purple-300">Royal Proclamation</dt>
                      <dd className="mt-1 text-sm text-purple-900 col-span-2 dark:text-purple-100">
                        <pre className="whitespace-pre-wrap">{result}</pre>
                      </dd>
                    </div>
                    <div className="px-6 py-5 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrint}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition-colors duration-300"
                      >
                        <Download size={20} />
                        <span>Create PDF</span>
                      </motion.button>
                    </div>
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
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdvancedQAGenerator;
