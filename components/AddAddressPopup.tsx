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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (firstName.length < 3) newErrors.firstName = 'First name must be at least 3 characters';
        if (lastName.length < 3) newErrors.lastName = 'Last name must be at least 3 characters';
        if (!/^\d{10}$/.test(mobile)) newErrors.mobile = 'Mobile number must be 10 digits';
        if (address1.length < 12) newErrors.address1 = 'Address Line 1 must be at least 12 characters';
        if (pincode.length !== 6) newErrors.pincode = 'Pincode must be 6 digits';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
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
            <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-1">Add new address</h2>
                <p className='text-sm text-gray-500 mb-4'>
                    Enter your address details to continue
                </p>
                <div className="flex flex-col gap-4">
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
                        <div className='flex flex-col relative w-full'>
                            <label htmlFor="firstName" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>First Name</label>
                            <input
                                type="text"
                                placeholder="John"
                                value={firstName}
                                required
                                onChange={(e) => setFirstName(e.target.value)}
                                className="border p-2 pl-2.5 w-full pt-2.5"
                            />
                            {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName}</span>}
                        </div>
                        <div className='flex flex-col relative w-full'>
                            <label htmlFor="lastName" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>Last Name</label>
                            <input
                                type="text"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="border p-2 pl-2.5 w-full pt-2.5"
                            />
                            {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
                        </div>
                    </div>
                    <div className='flex flex-col relative'>
                        <label htmlFor="mobile" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>Mobile Number</label>
                        <div className="flex items-center justify-between gap-0 border w-full">
                            <span className='pl-2 text-base'>+91</span>
                            <input
                                type="number"
                                placeholder="9876543210"
                                value={mobile}
                                required
                                onChange={(e) => setMobile(e.target.value)}
                                className='focus:outline-none active:outline-none outline-none p-2 pl-2.5 w-full pt-2.5'
                            />
                        </div>
                        {errors.mobile && <span className="text-red-500 text-xs">{errors.mobile}</span>}
                    </div>
                    <div className='flex flex-col relative'>
                        <label htmlFor="address1" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>Address Line 1</label>
                        <input
                            type="text"
                            placeholder="123, Main Street, City"
                            value={address1}
                            required
                            onChange={(e) => setAddress1(e.target.value)}
                            className="border p-2 pl-2.5 w-full pt-2.5"
                        />
                        {errors.address1 && <span className="text-red-500 text-xs">{errors.address1}</span>}
                    </div>
                    <div className='flex flex-col relative'>
                        <label htmlFor="address2" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>Address Line 2</label>
                        <input
                            type="text"
                            placeholder="Church Street, City."
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            className="border p-2 pl-2.5 w-full pt-2.5"
                        />
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                        <div className='flex flex-col relative w-full'>
                            <label htmlFor="landmark" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>Landmark</label>
                            <input
                                type="text"
                                placeholder="Opposite to KFC"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                className="border p-2 pl-2.5 w-full pt-2.5"
                            />
                        </div>
                        <div className='flex flex-col relative w-full'>
                            <label htmlFor="pincode" className='text-gray-500 absolute bg-white text-xs left-1 -top-2 px-2'>Pincode</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={pincode}
                                required
                                onChange={(e) => setPincode(e.target.value)}
                                className="border p-2 pl-2.5 w-full pt-2.5"
                            />
                            {errors.pincode && <span className="text-red-500 text-xs">{errors.pincode}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-4">
                    <Button onClick={onClose} className="bg-gray-300">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-black text-white">Add Address</Button>
                </div>
            </div>
        </div>
    );
};

export default AddAddressPopup; 