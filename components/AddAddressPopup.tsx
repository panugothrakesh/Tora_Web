'use client';

import React, { useState } from 'react';
import { useBasketStore } from '@/store/store';
import { Button } from './ui/button';

interface AddAddressPopupProps {
    onClose: () => void;
}

const AddAddressPopup: React.FC<AddAddressPopupProps> = ({ onClose }) => {
    const addAddress = useBasketStore((state) => state.addAddress);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobile, setMobile] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [landmark, setLandmark] = useState('');
    const [pincode, setPincode] = useState('');

    const handleSubmit = () => {
        const newAddress = {
            firstName,
            lastName,
            mobile,
            address1,
            address2,
            landmark,
            pincode,
        };
        addAddress(newAddress);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add New Address</h2>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Address Line 1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Address Line 2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="border p-2 mb-4 w-full"
                />
                <div className="flex justify-between">
                    <Button onClick={onClose} className="bg-gray-300">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-blue-500 text-white">Add Address</Button>
                </div>
            </div>
        </div>
    );
};

export default AddAddressPopup; 