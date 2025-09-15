import { Button } from '@/components/admin/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { Input } from '@/components/admin/ui/input';
import * as Lucide from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { useMemo, useState } from 'react';

type IconPickerProps = {
    value?: string | null;
    onChange: (iconName: string | null) => void;
    trigger?: React.ReactNode;
    title?: string;
};

function toPascalCaseFromKebab(kebab: string): string {
    return kebab
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function resolveLucideComponent(name?: string | null): React.ComponentType<{ className?: string }> | null {
    if (!name) return null;
    const pascal = /[A-Z]/.test(name) ? name : toPascalCaseFromKebab(name);
    const rec = Lucide as unknown as Record<string, unknown>;
    const Comp = rec[pascal];
    return typeof Comp === 'function' ? (Comp as React.ComponentType<{ className?: string }>) : null;
}

export function IconPreview({ name, className }: { name?: string | null; className?: string }) {
    const Comp = resolveLucideComponent(name);
    if (!Comp) return null;
    return <Comp className={className} />;
}

export default function IconPicker({ value, onChange, trigger, title = 'Select Icon' }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    // Build icon list from lucide-react exports (only components with displayName)
    const allIconNames = useMemo<string[]>(() => {
        const record = Lucide as unknown as Record<string, unknown>;
        let keys = Object.keys(record).filter((k) => {
            const v = record[k] as unknown;
            return typeof v === 'function' && k[0] === k[0].toUpperCase();
        });
        // Fallback to dynamicIconImports if tree-shaking removed static exports in prod
        if (keys.length === 0) {
            keys = Object.keys(dynamicIconImports ?? {});
        }
        return keys.sort((a, b) => a.localeCompare(b));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allIconNames;
        return allIconNames.filter((k) => k.toLowerCase().includes(q));
    }, [allIconNames, query]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" type="button">
                        {value ? (
                            <div className="flex items-center gap-2">
                                <IconPreview name={value} className="h-4 w-4" />
                                <span className="text-sm">{value}</span>
                            </div>
                        ) : (
                            <span className="text-sm">Choose icon</span>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search icons..." value={query} onChange={(e) => setQuery(e.target.value)} />
                        <Button
                            variant="ghost"
                            onClick={() => {
                                onChange(null);
                                setOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {filtered.map((name) => {
                            const Comp = resolveLucideComponent(name);
                            if (!Comp) return null;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        onChange(name);
                                        setOpen(false);
                                    }}
                                    className={`hover:bg-muted flex flex-col items-center justify-center gap-2 rounded-md border p-3 transition ${
                                        value && (value === name || toPascalCaseFromKebab(value) === name) ? 'border-green-500 bg-green-50' : ''
                                    }`}
                                >
                                    <Comp className="h-6 w-6" />
                                    <span className="text-muted-foreground break-all text-center text-xs">{name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
