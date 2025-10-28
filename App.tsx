
import React, { useState, useCallback, useEffect } from 'react';
import {
    caesarEncrypt,
    caesarDecrypt,
    generateRsaKeys,
    rsaEncrypt,
    rsaDecrypt,
    type RsaKeys
} from './services/cryptoService';

type Algorithm = 'caesar' | 'rsa';
type Mode = 'encrypt' | 'decrypt';

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const App: React.FC = () => {
    const [algorithm, setAlgorithm] = useState<Algorithm>('caesar');
    const [mode, setMode] = useState<Mode>('encrypt');
    const [inputText, setInputText] = useState<string>('مرحباً بالعالم!');
    const [outputText, setOutputText] = useState<string>('');
    const [caesarShift, setCaesarShift] = useState<number>(3);
    const [rsaKeys, setRsaKeys] = useState<RsaKeys | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    const copyToClipboard = (text: string, name: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        showToast(`تم نسخ ${name}!`);
    };

    const handleGenerateKeys = useCallback(() => {
        setIsLoading(true);
        setError(null);
        // Using setTimeout to allow UI to update before blocking for key generation
        setTimeout(() => {
            try {
                const keys = generateRsaKeys(32); // Using larger bits for more robust demo
                setRsaKeys(keys);
            } catch (e) {
                setError("فشل في إنشاء المفاتيح.");
            } finally {
                setIsLoading(false);
            }
        }, 50);
    }, []);
    
    useEffect(() => {
        if (algorithm === 'rsa' && !rsaKeys) {
            handleGenerateKeys();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algorithm]);


    const handleProcess = () => {
        setError(null);
        try {
            if (algorithm === 'caesar') {
                const shift = isNaN(caesarShift) ? 0 : caesarShift;
                const result = mode === 'encrypt' ? caesarEncrypt(inputText, shift) : caesarDecrypt(inputText, shift);
                setOutputText(result);
            } else if (algorithm === 'rsa') {
                if (!rsaKeys) {
                    setError("الرجاء إنشاء مفاتيح RSA أولاً.");
                    return;
                }
                if (mode === 'encrypt') {
                    const result = rsaEncrypt(inputText, rsaKeys.publicKey.e, rsaKeys.publicKey.n);
                    setOutputText(result);
                } else {
                    const result = rsaDecrypt(inputText, rsaKeys.privateKey.d, rsaKeys.privateKey.n);
                    setOutputText(result);
                }
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(`حدث خطأ: ${e.message}`);
            } else {
                setError("حدث خطأ غير معروف.");
            }
            setOutputText('');
        }
    };

    const renderKeyManagement = () => {
        if (algorithm === 'caesar') {
            return (
                <div className="w-full">
                    <label htmlFor="shift" className="block text-sm font-medium text-gray-400 mb-1">مقدار الإزاحة</label>
                    <input
                        id="shift"
                        type="number"
                        value={caesarShift}
                        onChange={(e) => setCaesarShift(parseInt(e.target.value, 10))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        min="1"
                        max="25"
                    />
                </div>
            );
        }

        if (algorithm === 'rsa') {
            return (
                <div className="w-full space-y-4">
                    <button
                        onClick={handleGenerateKeys}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                             <KeyIcon className="h-5 w-5"/>
                        )}
                        {isLoading ? 'جاري الإنشاء...' : 'إنشاء مفاتيح RSA جديدة'}
                    </button>
                    {rsaKeys && (
                        <div className="space-y-3 text-sm">
                            <KeyDisplay title="المفتاح العام (E, N)" value={`${rsaKeys.publicKey.e}, ${rsaKeys.publicKey.n}`} onCopy={() => copyToClipboard(`${rsaKeys.publicKey.e}, ${rsaKeys.publicKey.n}`, 'المفتاح العام')} />
                            <KeyDisplay title="المفتاح الخاص (D, N)" value={`${rsaKeys.privateKey.d}, ${rsaKeys.privateKey.n}`} onCopy={() => copyToClipboard(`${rsaKeys.privateKey.d}, ${rsaKeys.privateKey.n}`, 'المفتاح الخاص')} />
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };
    
    const KeyDisplay: React.FC<{title: string, value: string, onCopy: () => void}> = ({title, value, onCopy}) => (
        <div>
            <h4 className="font-semibold text-gray-400">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <p className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md truncate font-mono text-xs">{value}</p>
                <button onClick={onCopy} className="p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition">
                    <CopyIcon />
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-indigo-900/30">
            <div className="w-full max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl shadow-black/30 p-6 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">أداة التشفير</h1>
                    <p className="text-gray-400 mt-2">تشفير وفك تشفير النصوص باستخدام خوارزميات RSA و Caesar</p>
                </header>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Controls Column */}
                    <div className="space-y-6 flex flex-col">
                        <ControlGroup title="1. اختر الخوارزمية">
                            <SegmentedControl<Algorithm>
                                options={[{ label: 'Caesar', value: 'caesar' }, { label: 'RSA', value: 'rsa' }]}
                                value={algorithm}
                                onChange={setAlgorithm}
                            />
                        </ControlGroup>
                        <ControlGroup title="2. اختر العملية">
                            <SegmentedControl<Mode>
                                options={[{ label: 'تشفير', value: 'encrypt' }, { label: 'فك التشفير', value: 'decrypt' }]}
                                value={mode}
                                onChange={setMode}
                            />
                        </ControlGroup>
                        <ControlGroup title="3. إدارة المفاتيح">
                            {renderKeyManagement()}
                        </ControlGroup>
                         <button
                            onClick={handleProcess}
                            className="w-full mt-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md text-lg transition duration-300 transform hover:scale-105"
                        >
                            {mode === 'encrypt' ? 'شفّر الآن' : 'فك التشفير الآن'}
                        </button>
                    </div>

                    {/* Text IO Column */}
                    <div className="space-y-6">
                         <div className="relative">
                            <label htmlFor="input" className="block text-sm font-medium text-gray-400 mb-1">النص المدخل</label>
                            <textarea
                                id="input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={6}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
                                placeholder="اكتب أو الصق النص هنا..."
                            ></textarea>
                        </div>
                         <div className="relative">
                            <label htmlFor="output" className="block text-sm font-medium text-gray-400 mb-1">النص الناتج</label>
                            <textarea
                                id="output"
                                value={outputText}
                                readOnly
                                rows={6}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md resize-none font-mono text-sm"
                                placeholder="ستظهر النتيجة هنا..."
                            ></textarea>
                            {outputText && (
                               <button onClick={() => copyToClipboard(outputText, 'النص الناتج')} className="absolute top-8 left-2 p-2 text-gray-400 hover:text-white transition">
                                    <CopyIcon />
                                </button>
                            )}
                        </div>
                        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-md text-sm">{error}</div>}
                    </div>
                </div>
            </div>
            {toast && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">
                    {toast}
                </div>
            )}
            <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(10px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 2s ease-in-out;
                }
            `}</style>
        </div>
    );
};

interface ControlGroupProps {
    title: string;
    children: React.ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ title, children }) => (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">{title}</h3>
        {children}
    </div>
);


interface SegmentedControlProps<T extends string> {
    options: { label: string; value: T }[];
    value: T;
    onChange: (value: T) => void;
}

const SegmentedControl = <T extends string,>({ options, value, onChange }: SegmentedControlProps<T>) => {
    return (
        <div className="flex w-full bg-gray-700 rounded-md p-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`w-1/2 py-2 px-4 rounded-md text-sm font-bold transition-colors duration-300 ${
                        value === option.value ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default App;

