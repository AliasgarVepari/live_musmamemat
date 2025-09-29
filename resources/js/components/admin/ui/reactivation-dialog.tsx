import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/ui/dialog';
import { Button } from '@/components/admin/ui/button';
import { UserCheck } from 'lucide-react';

interface ReactivationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    userName: string;
}

export const ReactivationDialog: React.FC<ReactivationDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    userName
}) => {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">Reactivate User Account</DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-sm">
                                Are you sure you want to reactivate "{userName}"? This will restore their access to the platform.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="default" onClick={handleConfirm}>
                        Yes, Reactivate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
