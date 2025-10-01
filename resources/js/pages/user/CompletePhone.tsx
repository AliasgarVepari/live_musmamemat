import React, { useState } from 'react';
import UserLayout from '@/layouts/user/user-layout';
import { Button } from '@/components/user/ui/button';
import { Input } from '@/components/user/ui/input';
import { useToast } from '@/contexts/ToastContext';
import { Head } from '@inertiajs/react';

export default function CompletePhone() {
    const { addToast } = useToast();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [stage, setStage] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);

    const sendOtp = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/user/auth/phone/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed');
            setStage('otp');
            addToast({ type: 'info', title: 'OTP Sent', message: 'Enter the 6-digit code.' });
        } catch (e: any) {
            addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to send OTP' });
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/user/auth/phone/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed');

            localStorage.setItem('authUser', JSON.stringify(data.data.user));
            localStorage.setItem('authToken', data.data.token);
            window.location.href = '/auth/login/' + data.data.token;
        } catch (e: any) {
            addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to verify OTP' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout>
            <Head title="Complete Phone" />
            <div className="mx-auto w-full max-w-md p-4">
                <h1 className="mb-4 text-xl font-semibold">Complete your phone</h1>
                {stage === 'phone' ? (
                    <div className="space-y-3">
                        <Input placeholder="Phone (8 digits)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Button onClick={sendOtp} disabled={loading || phone.length !== 8} className="w-full">
                            {loading ? 'Sending…' : 'Send OTP'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <Button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="w-full">
                            {loading ? 'Verifying…' : 'Verify'}
                        </Button>
                    </div>
                )}
            </div>
        </UserLayout>
    );
}


