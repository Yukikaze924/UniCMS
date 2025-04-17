import { JSX, SVGProps } from 'react';

const PlaceholderIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
    return <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"></svg>;
};

export { PlaceholderIcon };

export * from './json';
export * from './mysql';
export * from './file-types';
export * from './status';
