import { Button } from '@/components/admin/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/admin/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'default',
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
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-sm">{description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {cancelText}
                    </Button>
                    <Button variant='destructive' onClick={handleConfirm}>
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
