import { ReactNode } from 'react';
import '../../../css/user/app.css';
interface UserLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: UserLayoutProps) => <>{children}</>;
