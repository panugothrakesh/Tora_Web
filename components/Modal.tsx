import { XIcon } from 'lucide-react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <XIcon className='w-6 h-6 cursor-pointer' onClick={onClose}/>
                </div>
                <p className="mb-4">{message}</p>
            </div>
        </div>
    );
};

export default Modal; 