import { ReactNode } from 'react';
import '../../../css/admin/app.css';
interface BaseLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: BaseLayoutProps) => <>{children}</>;
