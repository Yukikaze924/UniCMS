import { Navigate } from 'react-router';

const NotFound = () => {
    return (
        <>
            <Navigate to="/dashboard" />
        </>
    );
};

export default NotFound;
