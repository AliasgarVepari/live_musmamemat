import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/ui/dialog';
import { Button } from '@/components/admin/ui/button';
import { Textarea } from '@/components/admin/ui/textarea';
import { Label } from '@/components/admin/ui/label';
import { UserX } from 'lucide-react';

interface SuspensionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
    userName: string;
    isSuspending: boolean;
}

export const SuspensionDialog: React.FC<SuspensionDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    userName,
    isSuspending
}) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for suspension.');
            return;
        }
        onConfirm(reason);
        setReason('');
        onOpenChange(false);
    };

    const handleCancel = () => {
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                <UserX className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">Suspend User Account</DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-sm">
                                Are you sure you want to suspend "{userName}"? Please provide a reason for this action.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="suspension-reason">Reason for suspension</Label>
                        <Textarea
                            id="suspension-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter the reason for suspending this user..."
                            className="mt-1"
                            rows={4}
                            required
                        />
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={handleCancel} disabled={isSuspending}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isSuspending}
                    >
                        {isSuspending ? 'Suspending...' : 'Suspend User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
