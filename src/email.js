import { useState } from 'react';
import { Mail, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// const API_ENDPOINT = process.env.REACT_APP_new_url;


const PDFEmailSender = ({ onToggleModal, generatedContent, costDetails }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const validateEmail = (email) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleSendPDF = async () => {
        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (!generatedContent) {
            toast.error('No content available to send');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_new_url}/send-pdf`,
                {
                    email,
                    content: generatedContent,
                    token_count: costDetails?.token_count || 0,
                    embedding_cost: costDetails?.embedding_cost || 0,
                    total_cost: (costDetails?.embedding_cost || 0) + 0.02 // Adding base cost
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                toast.success('PDF sent successfully to your email!');
                setSent(true);
                setEmail('');
                onToggleModal()
            }
        } catch (error) {
            console.error('PDF sending error:', error);
            toast.error(
                error.response?.data?.error ||
                'Failed to send PDF. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2 text-purple-600">
                    <FileText size={24} />
                    <h2 className="text-xl font-semibold">
                        Send Generated Content as PDF
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-1 px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        disabled={loading || sent}
                    />

                    <button
                        onClick={handleSendPDF}
                        disabled={loading || sent || !email || !generatedContent}
                        className="flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Mail size={18} />
                        )}
                        <span>
                            {loading ? 'Sending...' : sent ? 'Sent!' : 'Send PDF'}
                        </span>
                    </button>
                </div>

                {costDetails && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Cost Details:
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p>Token Count: {costDetails.token_count}</p>
                            <p>Embedding Cost: ${costDetails.embedding_cost.toFixed(4)}</p>
                            <p>Base Cost: $0.02</p>
                            <p className="font-semibold mt-1">
                                Total Cost: ${(costDetails.embedding_cost + 0.02).toFixed(4)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFEmailSender;